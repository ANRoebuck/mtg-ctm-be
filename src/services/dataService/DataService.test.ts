import fs from 'fs';
import os from 'os';
import path from 'path';
import { DataService } from './DataService';

let dir: string;
let services: DataService[];

const open = (): DataService => {
    const service = new DataService(dir);
    services.push(service);
    return service;
};

beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dataservice-test-'));
    services = [];
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
    services.forEach(s => s.close());
    fs.rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
});

describe('persistence', () => {
    it('restores search and click-through events after a restart', async () => {
        const first = open();
        await first.recordSearchHistory(['Lightning Bolt', 'Counterspell']);
        await first.recordSearchHistory(['Lightning Bolt']);
        await first.recordClickThrough('Lightning Bolt', 'Axion');
        first.close();

        const second = open();
        const history = await second.getSearchHistory();
        expect(history.find(h => h.term === 'Lightning Bolt')?.count).toBe(2);
        expect(history.find(h => h.term === 'Counterspell')?.count).toBe(1);
        expect(await second.getClickThroughsBySeller()).toEqual([{ name: 'Axion', count: 1 }]);
    });

    it('keeps original timestamps across a restart', async () => {
        const first = open();
        await first.recordSearchHistory(['Lightning Bolt']);
        const [before] = await first.getSearchHistory();
        first.close();

        const [after] = await open().getSearchHistory();
        expect(after.lastSearchedAt).toEqual(before.lastSearchedAt);
    });

    it('persists prunes', async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
        const first = open();
        await first.recordSearchHistory(['Old']);
        await first.recordClickThrough('Old', 'Axion');
        jest.setSystemTime(new Date('2024-02-01T00:00:00Z'));
        await first.recordSearchHistory(['New']);
        expect(await first.pruneSearchHistory(10)).toEqual({ removed: 1 });
        expect(await first.pruneClickThroughs(10)).toEqual({ removed: 1 });
        first.close();
        jest.useRealTimers();

        const second = open();
        expect((await second.getSearchHistory()).map(h => h.term)).toEqual(['New']);
        expect(await second.getClickThroughsBySeller()).toEqual([]);
    });

    it('persists resets', async () => {
        const first = open();
        await first.recordSearchHistory(['Lightning Bolt']);
        first.resetSearchHistory();
        first.close();

        expect(await open().getSearchHistory()).toEqual([]);
    });

    it('discards a partial trailing line left by a power cut and keeps appending cleanly', async () => {
        const first = open();
        await first.recordSearchHistory(['Lightning Bolt']);
        first.close();

        const file = path.join(dir, 'search-events.jsonl');
        fs.appendFileSync(file, '{"term":"Counter');

        const second = open();
        expect((await second.getSearchHistory()).map(h => h.term)).toEqual(['Lightning Bolt']);
        await second.recordSearchHistory(['Counterspell']);
        second.close();

        const third = open();
        expect((await third.getSearchHistory()).map(h => h.term).sort()).toEqual(['Counterspell', 'Lightning Bolt']);
    });

    it('skips unreadable complete lines rather than failing to start', async () => {
        const file = path.join(dir, 'search-events.jsonl');
        fs.writeFileSync(file, 'not json\n{"term":"Lightning Bolt","searchedAt":"2024-01-01T00:00:00.000Z"}\n{"nope":1}\n');

        expect((await open().getSearchHistory()).map(h => h.term)).toEqual(['Lightning Bolt']);
    });

    it('does not record an event in memory if persisting it fails', async () => {
        const service = open();
        service.close(); // closed log => append throws
        jest.spyOn(console, 'error').mockImplementation(() => undefined);

        await expect(service.recordSearchHistory(['Lightning Bolt'])).rejects.toMatchObject({ status: 500 });
        expect(await service.getSearchHistory()).toEqual([]);
    });
});
