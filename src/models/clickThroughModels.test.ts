import { recordClickThrough, getClickThroughsBySeller, getClickThroughsByCard, getClickThroughsCardsBySeller, pruneClickThroughs, resetClickThroughs } from './clickThroughModels';

beforeEach(() => {
    resetClickThroughs();
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('recordClickThrough', () => {
    it('rejects if card is missing', async () => {
        await expect(recordClickThrough('', '401 Games'))
            .rejects.toMatchObject({ status: 400 });
    });

    it('rejects if seller is missing', async () => {
        await expect(recordClickThrough('Lightning Bolt', ''))
            .rejects.toMatchObject({ status: 400 });
    });
});

describe('getClickThroughsBySeller', () => {
    it('returns empty array when no events recorded', async () => {
        expect(await getClickThroughsBySeller()).toEqual([]);
    });

    it('returns one entry per unique seller with correct count', async () => {
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Counterspell', '401 Games');
        await recordClickThrough('Lightning Bolt', 'Face to Face');

        const result = await getClickThroughsBySeller();
        expect(result).toHaveLength(2);

        const fof = result.find(r => r.name === '401 Games');
        expect(fof?.count).toBe(2);

        const ftf = result.find(r => r.name === 'Face to Face');
        expect(ftf?.count).toBe(1);
    });

    it('sorts by count descending', async () => {
        await recordClickThrough('Lightning Bolt', 'Face to Face');
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Counterspell', '401 Games');

        const result = await getClickThroughsBySeller();
        expect(result[0].name).toBe('401 Games');
        expect(result[1].name).toBe('Face to Face');
    });

    it('returns all results when no days param provided', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordClickThrough('Lightning Bolt', 'Old Seller');

        jest.setSystemTime(new Date('2026-04-22'));
        await recordClickThrough('Lightning Bolt', 'New Seller');

        expect(await getClickThroughsBySeller()).toHaveLength(2);
    });

    it('filters to the last N days when days param is provided', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordClickThrough('Lightning Bolt', 'Old Seller');

        jest.setSystemTime(new Date('2026-04-22'));
        await recordClickThrough('Lightning Bolt', 'New Seller');

        const result = await getClickThroughsBySeller(30);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('New Seller');
    });
});

describe('getClickThroughsByCard', () => {
    it('returns empty array when no events recorded', async () => {
        expect(await getClickThroughsByCard()).toEqual([]);
    });

    it('returns one entry per unique card with correct count', async () => {
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Lightning Bolt', 'Face to Face');
        await recordClickThrough('Counterspell', '401 Games');

        const result = await getClickThroughsByCard();
        expect(result).toHaveLength(2);

        const bolt = result.find(r => r.name === 'Lightning Bolt');
        expect(bolt?.count).toBe(2);

        const counter = result.find(r => r.name === 'Counterspell');
        expect(counter?.count).toBe(1);
    });

    it('sorts by count descending', async () => {
        await recordClickThrough('Counterspell', '401 Games');
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Lightning Bolt', 'Face to Face');

        const result = await getClickThroughsByCard();
        expect(result[0].name).toBe('Lightning Bolt');
        expect(result[1].name).toBe('Counterspell');
    });

    it('filters to the last N days when days param is provided', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordClickThrough('Old Card', '401 Games');

        jest.setSystemTime(new Date('2026-04-22'));
        await recordClickThrough('New Card', '401 Games');

        const result = await getClickThroughsByCard(30);
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('New Card');
    });
});

describe('getClickThroughsCardsBySeller', () => {
    it('returns empty array when no events recorded', async () => {
        expect(await getClickThroughsCardsBySeller()).toEqual([]);
    });

    it('returns one entry per seller, each with its own card breakdown', async () => {
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Counterspell', '401 Games');
        await recordClickThrough('Lightning Bolt', 'Face to Face');

        const result = await getClickThroughsCardsBySeller();
        expect(result).toHaveLength(2);

        const fof = result.find(r => r.seller === '401 Games');
        expect(fof?.cards).toEqual([
            { name: 'Lightning Bolt', count: 2 },
            { name: 'Counterspell', count: 1 },
        ]);

        const ftf = result.find(r => r.seller === 'Face to Face');
        expect(ftf?.cards).toEqual([{ name: 'Lightning Bolt', count: 1 }]);
    });

    it('sorts sellers by total click-through count descending', async () => {
        await recordClickThrough('Lightning Bolt', 'Face to Face');
        await recordClickThrough('Lightning Bolt', '401 Games');
        await recordClickThrough('Counterspell', '401 Games');

        const result = await getClickThroughsCardsBySeller();
        expect(result[0].seller).toBe('401 Games');
        expect(result[1].seller).toBe('Face to Face');
    });

    it('filters to the last N days when days param is provided', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordClickThrough('Old Card', 'Old Seller');

        jest.setSystemTime(new Date('2026-04-22'));
        await recordClickThrough('New Card', 'New Seller');

        const result = await getClickThroughsCardsBySeller(30);
        expect(result).toHaveLength(1);
        expect(result[0].seller).toBe('New Seller');
    });
});

describe('pruneClickThroughs', () => {
    it('removes events older than the given number of days', async () => {
        jest.setSystemTime(new Date('2026-01-01'));
        await recordClickThrough('Old Card', 'Old Seller');

        jest.setSystemTime(new Date('2026-04-22'));
        await recordClickThrough('New Card', 'New Seller');

        const { removed } = await pruneClickThroughs(30);
        expect(removed).toBe(1);

        const sellers = await getClickThroughsBySeller();
        expect(sellers).toHaveLength(1);
        expect(sellers[0].name).toBe('New Seller');
    });

    it('returns 0 when no events are old enough to remove', async () => {
        jest.setSystemTime(new Date('2026-04-22'));
        await recordClickThrough('Lightning Bolt', '401 Games');

        const { removed } = await pruneClickThroughs(30);
        expect(removed).toBe(0);
    });

    it('returns 0 when there are no events', async () => {
        const { removed } = await pruneClickThroughs(30);
        expect(removed).toBe(0);
    });
});
