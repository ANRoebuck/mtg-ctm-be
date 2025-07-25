import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { MTG_CTM_CORS_ANYWHERE } from '../../../../gateway/http';

import { PriceGetter_Harlequins } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_Harlequins();
});

describe('PriceGetter_Harlequins', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Harlequins');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      MTG_CTM_CORS_ANYWHERE + 'https://www.harlequins-games.com/products/search?q=tarmogoyf&c=8&disable_mobile=1',
      {"headers": {"Origin": "compare-the-magic"}}
    );
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults);
  });

});
