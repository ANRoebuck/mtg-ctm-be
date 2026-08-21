import { getPrices } from './pricesModels';

describe('getPrices', () => {
    it('rejects if searchTerm is empty', async () => {
        await expect(getPrices('401 Games', '', false))
            .rejects.toMatchObject({ status: 400, message: 'searchTerm must not be empty' });
    });

    it('rejects if searchTerm is whitespace only', async () => {
        await expect(getPrices('401 Games', '   ', false))
            .rejects.toMatchObject({ status: 400, message: 'searchTerm must not be empty' });
    });

    it('rejects if seller is invalid', async () => {
        await expect(getPrices('not-a-real-seller', 'Lightning Bolt', false))
            .rejects.toMatchObject({ status: 404, message: 'Invalid seller: not-a-real-seller' });
    });
});
