import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { MTG_CTM_CORS_ANYWHERE } from '../../../../gateway/http';

import { PriceGetter_Manaleak } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_Manaleak();
});

describe('PriceGetter_Manaleak', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Manaleak');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      MTG_CTM_CORS_ANYWHERE + 'https://www.manaleak.com//index.php?route=product/search&search=tarmogoyf#/availability=1',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults);
  });

});
