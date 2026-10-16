import fs from 'fs';
import path from 'path';
import { ts } from '../../utils/Logger';

// Durable append-only log of events, stored as one JSON object per line (JSONL).
//
// Durability: every append is written and fsynced before it returns, so an event that
// has been acknowledged survives an app crash, a redeploy or a power cut. A power cut
// mid-write can leave a partial final line; load() detects and truncates it, so the
// next append always starts on a clean line.
//
// Pruning/clearing rewrites the whole file to a temp file, fsyncs it, then atomically
// renames it over the original, so a failure part-way leaves the old file intact.
export class EventLog<T> {

    #filePath: string;
    #serialise: (event: T) => unknown;
    #parse: (raw: unknown) => T | null;
    #fd: number | null = null;
    #size = 0;

    constructor(filePath: string, serialise: (event: T) => unknown, parse: (raw: unknown) => T | null) {
        this.#filePath = filePath;
        this.#serialise = serialise;
        this.#parse = parse;
    }

    // Reads every event from disk (creating the file if needed) and opens it for appending.
    load(): T[] {
        const dir = path.dirname(this.#filePath);
        fs.mkdirSync(dir, { recursive: true });

        const events: T[] = [];
        if (fs.existsSync(this.#filePath)) {
            const content = fs.readFileSync(this.#filePath, 'utf8');
            const completeLength = content.lastIndexOf('\n') + 1;

            if (completeLength < content.length) {
                console.warn(`[${ts()}] [EventLog] Discarding partial trailing line in ${this.#filePath}`);
                fs.truncateSync(this.#filePath, Buffer.byteLength(content.slice(0, completeLength)));
            }

            content.slice(0, completeLength).split('\n').forEach((line, i) => {
                if (!line) return;
                try {
                    const event = this.#parse(JSON.parse(line));
                    if (event) {
                        events.push(event);
                        return;
                    }
                } catch {
                    // fall through to the warning below
                }
                console.warn(`[${ts()}] [EventLog] Skipping unreadable line ${i + 1} in ${this.#filePath}`);
            });
        }

        this.#open();
        this.#syncDirectory();
        return events;
    }

    // Durably appends events; throws (leaving the file as it was) if the write fails.
    append(events: T[]): void {
        if (events.length === 0) return;
        const data = Buffer.from(events.map(e => JSON.stringify(this.#serialise(e)) + '\n').join(''), 'utf8');
        const fd = this.#requireFd();

        try {
            let written = 0;
            while (written < data.length) {
                written += fs.writeSync(fd, data, written);
            }
            fs.fsyncSync(fd);
            this.#size += data.length;
        } catch (err) {
            // Don't leave a partial line behind for the next append to glue itself onto.
            try { fs.ftruncateSync(fd, this.#size); } catch { /* nothing more we can do */ }
            throw err;
        }
    }

    // Atomically replaces the whole log with the given events.
    rewrite(events: T[]): void {
        const tmpPath = `${this.#filePath}.tmp`;
        const data = events.map(e => JSON.stringify(this.#serialise(e)) + '\n').join('');

        const tmpFd = fs.openSync(tmpPath, 'w');
        try {
            fs.writeSync(tmpFd, data);
            fs.fsyncSync(tmpFd);
        } finally {
            fs.closeSync(tmpFd);
        }

        fs.renameSync(tmpPath, this.#filePath);
        this.#syncDirectory();

        this.close();
        this.#open();
    }

    close(): void {
        if (this.#fd !== null) {
            fs.closeSync(this.#fd);
            this.#fd = null;
        }
    }

    #open(): void {
        this.#fd = fs.openSync(this.#filePath, 'a');
        this.#size = fs.fstatSync(this.#fd).size;
    }

    #requireFd(): number {
        if (this.#fd === null) throw new Error(`EventLog ${this.#filePath} is not open`);
        return this.#fd;
    }

    // Makes file creation/rename itself durable, not just the file contents.
    #syncDirectory(): void {
        try {
            const dirFd = fs.openSync(path.dirname(this.#filePath), 'r');
            try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
        } catch {
            // Not supported on every platform/filesystem; best effort.
        }
    }
}
