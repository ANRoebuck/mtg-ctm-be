import { recordSearchHistory, getSearchHistory, pruneSearchHistory, resetSearchHistory } from './searchHistoryModels';

beforeEach(() => {
    resetSearchHistory();
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('recordSearchHistory', () => {
    it('rejects if searchedFor is not an array', async () => {
        await expect(recordSearchHistory('Lightning Bolt' as any))
            .rejects.toMatchObject({ status: 400 });
    });
});

describe('getSearchHistory', () => {
    it('returns empty array when no history recorded', async () => {
        expect(await getSearchHistory()).toEqual([]);
    });

    it('returns one entry per unique term with correct count', async () => {
        await recordSearchHistory(['Lightning Bolt', 'Counterspell']);
        await recordSearchHistory(['Lightning Bolt']);

        const result = await getSearchHistory();
        expect(result).toHaveLength(2);

        const bolt = result.find(r => r.term === 'Lightning Bolt');
        expect(bolt?.count).toBe(2);

        const counter = result.find(r => r.term === 'Counterspell');
        expect(counter?.count).toBe(1);
    });

    it('sorts by count descending', async () => {
        await recordSearchHistory(['Counterspell']);
        await recordSearchHistory(['Lightning Bolt']);
        await recordSearchHistory(['Lightning Bolt']);

        const result = await getSearchHistory();
        expect(result[0].term).toBe('Lightning Bolt');
        expect(result[1].term).toBe('Counterspell');
    });

    it('tracks the most recent search time per term', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordSearchHistory(['Lightning Bolt']);

        jest.setSystemTime(new Date('2026-04-22'));
        await recordSearchHistory(['Lightning Bolt']);

        const [entry] = await getSearchHistory();
        expect(entry.lastSearchedAt).toEqual(new Date('2026-04-22'));
    });

    it('returns all results when no days param provided', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordSearchHistory(['old term']);

        jest.setSystemTime(new Date('2026-04-22'));
        await recordSearchHistory(['new term']);

        expect(await getSearchHistory()).toHaveLength(2);
    });

    it('filters to the last N days when days param is provided', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordSearchHistory(['old term']);

        jest.setSystemTime(new Date('2026-04-22'));
        await recordSearchHistory(['new term']);

        const result = await getSearchHistory(30);
        expect(result).toHaveLength(1);
        expect(result[0].term).toBe('new term');
    });

    it('includes terms searched exactly at the boundary of the days window', async () => {
        jest.setSystemTime(new Date('2026-03-23')); // exactly 30 days before Apr 22
        await recordSearchHistory(['boundary term']);

        jest.setSystemTime(new Date('2026-04-22'));

        const result = await getSearchHistory(30);
        expect(result).toHaveLength(1);
        expect(result[0].term).toBe('boundary term');
    });
});

describe('pruneSearchHistory', () => {
    it('removes events older than the given number of days', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordSearchHistory(['old term']);

        jest.setSystemTime(new Date('2026-04-22'));
        await recordSearchHistory(['new term']);

        const { removed } = await pruneSearchHistory(30);
        expect(removed).toBe(1);

        const result = await getSearchHistory();
        expect(result).toHaveLength(1);
        expect(result[0].term).toBe('new term');
    });

    it('returns 0 when no events are old enough to remove', async () => {
        jest.setSystemTime(new Date('2026-04-22'));
        await recordSearchHistory(['recent term']);

        const { removed } = await pruneSearchHistory(30);
        expect(removed).toBe(0);
    });

    it('returns 0 when history is empty', async () => {
        const { removed } = await pruneSearchHistory(30);
        expect(removed).toBe(0);
    });
});
