import os from 'os';
import path from 'path';
import { EventLog } from './EventLog';
import { ts } from '../../utils/Logger';

// Events are persisted to append-only JSONL logs (see EventLog) in a data directory and
// loaded back into memory on startup. Reads are served from memory; every write goes to
// disk first. The directory is DATA_DIR if set, otherwise ~/.mtg-ctm-be, so that
// redeploying the app (which replaces the checkout) leaves the data alone. Under jest
// (NODE_ENV=test) nothing is persisted.
//
// To move to SQLite later: create search_events / click_through_events tables matching the
// interfaces below, import the two .jsonl files once, then swap the EventLog calls in this
// class for INSERT / DELETE statements and the in-memory aggregations for GROUP BY queries.

interface SearchEvent {
    term: string;
    searchedAt: Date;
}

export interface SearchHistoryEntry {
    term: string;
    count: number;
    lastSearchedAt: Date;
}

interface ClickThroughEvent {
    card: string;
    seller: string;
    clickedAt: Date;
}

export interface ClickThroughEntry {
    name: string;
    count: number;
}

export interface SellerCardBreakdown {
    seller: string;
    cards: ClickThroughEntry[];
}

const parseDate = (raw: unknown): Date | null => {
    if (typeof raw !== 'string') return null;
    const date = new Date(raw);
    return isNaN(date.getTime()) ? null : date;
}

const parseSearchEvent = (raw: any): SearchEvent | null => {
    const searchedAt = parseDate(raw?.searchedAt);
    return typeof raw?.term === 'string' && searchedAt ? { term: raw.term, searchedAt } : null;
}

const parseClickThroughEvent = (raw: any): ClickThroughEvent | null => {
    const clickedAt = parseDate(raw?.clickedAt);
    return typeof raw?.card === 'string' && typeof raw?.seller === 'string' && clickedAt
        ? { card: raw.card, seller: raw.seller, clickedAt }
        : null;
}

const persistenceError = (err: unknown) => {
    console.error(`[${ts()}] [DataService] Failed to persist event`, err);
    return { status: 500, message: 'Failed to persist event' };
}

export interface SearchImportEntry {
    term: string;
    count: number;
    timestamp: string;
}

export interface ClickThroughImportEntry {
    card: string;
    seller: string;
    count: number;
    timestamp: string;
}

const invalidImport = (message: string) => Promise.reject({ status: 400, message });

const validCountAndTimestamp = (entry: any): boolean =>
    Number.isInteger(entry?.count) && entry.count > 0 && parseDate(entry?.timestamp) !== null;

export class DataService {

    #searchEvents: SearchEvent[] = [];
    #clickThroughEvents: ClickThroughEvent[] = [];
    #searchLog: EventLog<SearchEvent> | null = null;
    #clickThroughLog: EventLog<ClickThroughEvent> | null = null;

    // dataDir null => in-memory only. Throws if the directory can't be created/read, so
    // that a misconfigured deploy fails loudly rather than silently losing data.
    constructor(dataDir: string | null = null) {
        if (dataDir === null) return;

        this.#searchLog = new EventLog<SearchEvent>(
            path.join(dataDir, 'search-events.jsonl'),
            e => ({ term: e.term, searchedAt: e.searchedAt.toISOString() }),
            parseSearchEvent,
        );
        this.#clickThroughLog = new EventLog<ClickThroughEvent>(
            path.join(dataDir, 'click-through-events.jsonl'),
            e => ({ card: e.card, seller: e.seller, clickedAt: e.clickedAt.toISOString() }),
            parseClickThroughEvent,
        );

        this.#searchEvents = this.#searchLog.load();
        this.#clickThroughEvents = this.#clickThroughLog.load();
        console.log(`[${ts()}] [DataService] Loaded ${this.#searchEvents.length} search events and ` +
            `${this.#clickThroughEvents.length} click-through events from ${dataDir}`);
    }

    // TEMPORARY: one-off import of reconstructed historical data (see scripts/replayHistoricalData.js).
    // Each guard flips on success so a second run is rejected instead of doubling the data.
    // Remove these methods, the guards and the /api/admin/import routes once the replay has been run.
    #searchHistoryImported = false;
    #clickThroughsImported = false;

    importSearchHistory = (entries: SearchImportEntry[]): Promise<{ imported: number }> => {
        if (this.#searchHistoryImported) return invalidImport('search history has already been imported');
        if (!Array.isArray(entries) || !entries.every(e => typeof e?.term === 'string' && validCountAndTimestamp(e))) {
            return invalidImport('entries must be an array of { term, count, timestamp }');
        }

        const events: SearchEvent[] = [];
        for (const { term, count, timestamp } of entries) {
            for (let i = 0; i < count; i++) events.push({ term, searchedAt: new Date(timestamp) });
        }

        try {
            this.#searchLog?.append(events);
        } catch (err) {
            return Promise.reject(persistenceError(err));
        }
        for (const event of events) this.#searchEvents.push(event);
        this.#searchHistoryImported = true;
        return Promise.resolve({ imported: events.length });
    }

    importClickThroughs = (entries: ClickThroughImportEntry[]): Promise<{ imported: number }> => {
        if (this.#clickThroughsImported) return invalidImport('click-throughs have already been imported');
        if (!Array.isArray(entries) || !entries.every(e =>
            typeof e?.card === 'string' && typeof e?.seller === 'string' && validCountAndTimestamp(e))) {
            return invalidImport('entries must be an array of { card, seller, count, timestamp }');
        }

        const events: ClickThroughEvent[] = [];
        for (const { card, seller, count, timestamp } of entries) {
            for (let i = 0; i < count; i++) events.push({ card, seller, clickedAt: new Date(timestamp) });
        }

        try {
            this.#clickThroughLog?.append(events);
        } catch (err) {
            return Promise.reject(persistenceError(err));
        }
        for (const event of events) this.#clickThroughEvents.push(event);
        this.#clickThroughsImported = true;
        return Promise.resolve({ imported: events.length });
    }

    close = (): void => {
        this.#searchLog?.close();
        this.#clickThroughLog?.close();
    }

    resetSearchHistory = (): void => {
        this.#searchLog?.rewrite([]);
        this.#searchEvents = [];
    }

    recordSearchHistory = (searchedFor: string[]): Promise<void> => {
        if (!Array.isArray(searchedFor)) {
            return Promise.reject({ status: 400, message: 'searchedFor must be an array of strings' });
        }
        const now = new Date();
        const events = searchedFor.map(term => ({ term, searchedAt: now }));
        try {
            this.#searchLog?.append(events);
        } catch (err) {
            return Promise.reject(persistenceError(err));
        }
        this.#searchEvents.push(...events);
        return Promise.resolve();
    }

    getSearchHistory = (days?: number): Promise<SearchHistoryEntry[]> => {
        const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filtered = cutoff ? this.#searchEvents.filter(e => e.searchedAt >= cutoff) : this.#searchEvents;

        const aggregated = new Map<string, SearchHistoryEntry>();
        for (const { term, searchedAt } of filtered) {
            const existing = aggregated.get(term);
            if (existing) {
                existing.count++;
                if (searchedAt > existing.lastSearchedAt) existing.lastSearchedAt = searchedAt;
            } else {
                aggregated.set(term, { term, count: 1, lastSearchedAt: searchedAt });
            }
        }

        const result = Array.from(aggregated.values()).sort((a, b) => b.count - a.count);
        return Promise.resolve(result);
    }

    pruneSearchHistory = (olderThanDays: number): Promise<{ removed: number }> => {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
        const kept = this.#searchEvents.filter(e => e.searchedAt >= cutoff);
        const removed = this.#searchEvents.length - kept.length;
        try {
            if (removed > 0) this.#searchLog?.rewrite(kept);
        } catch (err) {
            return Promise.reject(persistenceError(err));
        }
        this.#searchEvents = kept;
        return Promise.resolve({ removed });
    }

    resetClickThroughs = (): void => {
        this.#clickThroughLog?.rewrite([]);
        this.#clickThroughEvents = [];
    }

    recordClickThrough = (card: string, seller: string): Promise<void> => {
        if (!card || !seller) {
            return Promise.reject({ status: 400, message: 'card and seller are required' });
        }
        const event = { card, seller, clickedAt: new Date() };
        try {
            this.#clickThroughLog?.append([event]);
        } catch (err) {
            return Promise.reject(persistenceError(err));
        }
        this.#clickThroughEvents.push(event);
        return Promise.resolve();
    }

    #aggregateClickThroughsBy = (key: keyof Omit<ClickThroughEvent, 'clickedAt'>, days?: number): ClickThroughEntry[] => {
        const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filtered = cutoff ? this.#clickThroughEvents.filter(e => e.clickedAt >= cutoff) : this.#clickThroughEvents;

        const counts = new Map<string, number>();
        for (const event of filtered) {
            const name = event[key];
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }

        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    getClickThroughsBySeller = (days?: number): Promise<ClickThroughEntry[]> => {
        return Promise.resolve(this.#aggregateClickThroughsBy('seller', days));
    }

    getClickThroughsByCard = (days?: number): Promise<ClickThroughEntry[]> => {
        return Promise.resolve(this.#aggregateClickThroughsBy('card', days));
    }

    getClickThroughsCardsBySeller = (days?: number): Promise<SellerCardBreakdown[]> => {
        const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filtered = cutoff ? this.#clickThroughEvents.filter(e => e.clickedAt >= cutoff) : this.#clickThroughEvents;

        const bySeller = new Map<string, Map<string, number>>();
        for (const event of filtered) {
            const cardCounts = bySeller.get(event.seller) ?? new Map<string, number>();
            cardCounts.set(event.card, (cardCounts.get(event.card) ?? 0) + 1);
            bySeller.set(event.seller, cardCounts);
        }

        const breakdown = Array.from(bySeller.entries()).map(([seller, cardCounts]) => ({
            seller,
            cards: Array.from(cardCounts.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count),
        }));

        breakdown.sort((a, b) =>
            b.cards.reduce((sum, c) => sum + c.count, 0) - a.cards.reduce((sum, c) => sum + c.count, 0)
        );

        return Promise.resolve(breakdown);
    }

    pruneClickThroughs = (olderThanDays: number): Promise<{ removed: number }> => {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
        const kept = this.#clickThroughEvents.filter(e => e.clickedAt >= cutoff);
        const removed = this.#clickThroughEvents.length - kept.length;
        try {
            if (removed > 0) this.#clickThroughLog?.rewrite(kept);
        } catch (err) {
            return Promise.reject(persistenceError(err));
        }
        this.#clickThroughEvents = kept;
        return Promise.resolve({ removed });
    }
}

const resolveDataDir = (): string | null => {
    if (process.env.NODE_ENV === 'test') return null;
    return process.env.DATA_DIR || path.join(os.homedir(), '.mtg-ctm-be');
}

const dataService = new DataService(resolveDataDir());

export default dataService;
