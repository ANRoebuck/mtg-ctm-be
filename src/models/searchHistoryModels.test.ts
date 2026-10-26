import { recordSearchHistory, getSearchHistory, pruneSearchHistory, resetSearchHistory, getRecentSearches, getSearchesByDate } from './searchHistoryModels';

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

describe('getRecentSearches', () => {
    it('returns raw events, most recent first, limited to count', async () => {
        await recordSearchHistory(['A']);
        jest.advanceTimersByTime(1000);
        await recordSearchHistory(['B']);
        jest.advanceTimersByTime(1000);
        await recordSearchHistory(['A']);

        const result = await getRecentSearches(2);
        expect(result.map(e => e.term)).toEqual(['A', 'B']);
        expect(result[0].searchedAt.getTime()).toBeGreaterThan(result[1].searchedAt.getTime());
    });

    it('returns everything if fewer than count exist', async () => {
        await recordSearchHistory(['A']);
        expect(await getRecentSearches(50)).toHaveLength(1);
    });

    it('defaults to 20 when count is not provided', async () => {
        await recordSearchHistory(Array.from({ length: 30 }, (_, i) => `term${i}`));
        expect(await getRecentSearches()).toHaveLength(20);
    });

    it('caps at 100 rather than rejecting', async () => {
        await recordSearchHistory(Array.from({ length: 150 }, (_, i) => `term${i}`));
        const result = await getRecentSearches(1000);
        expect(result).toHaveLength(100);
        expect(result[0].term).toBe('term149');
    });

    it.each([0, -1, 1.5, NaN])('rejects invalid count %p', async count => {
        await expect(getRecentSearches(count)).rejects.toMatchObject({ status: 400 });
    });
});

describe('getSearchesByDate', () => {
    beforeEach(() => {
        jest.setSystemTime(new Date('2025-03-31T12:00:00Z'));
    });

    it('counts per date, oldest first, including empty dates', async () => {
        jest.setSystemTime(new Date('2025-03-30T09:00:00Z'));
        await recordSearchHistory(['Lightning Bolt']);
        await recordSearchHistory(['Lightning Bolt']);
        jest.setSystemTime(new Date('2025-03-31T12:00:00Z'));

        const result = await getSearchesByDate(3);
        expect(result).toEqual({ '2025-03-29': 0, '2025-03-30': 2, '2025-03-31': 0 });
        expect(Object.keys(result)).toEqual(['2025-03-29', '2025-03-30', '2025-03-31']);
    });

    it('excludes events older than the window', async () => {
        jest.setSystemTime(new Date('2025-03-20T12:00:00Z'));
        await recordSearchHistory(['Lightning Bolt']);
        jest.setSystemTime(new Date('2025-03-31T12:00:00Z'));
        await recordSearchHistory(['Lightning Bolt']);

        const result = await getSearchesByDate(5);
        expect(Object.values(result).reduce((a, b) => a + b, 0)).toBe(1);
    });

    it('defaults to 30 days', async () => {
        expect(Object.keys(await getSearchesByDate())).toHaveLength(30);
    });

    it('caps at 100 days rather than rejecting', async () => {
        expect(Object.keys(await getSearchesByDate(1000))).toHaveLength(100);
    });

    it.each([0, -1, 1.5, NaN])('rejects invalid days %p', async days => {
        await expect(getSearchesByDate(days)).rejects.toMatchObject({ status: 400 });
    });
});
