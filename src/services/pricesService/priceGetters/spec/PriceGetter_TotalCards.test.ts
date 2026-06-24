import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_TotalCards } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_TotalCards();
});

describe('PriceGetter_TotalCards', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Total Cards');
  });

  it('gets results for Botanical Sanctum', async () => {
    const searchTerm = 'botanical sanctum';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.post.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5002/api/scrape',
      {
        targetUrl: 'https://totalcards.net/search?type=product&options%5Bprefix%5D=last&q=botanical+sanctum',
        lazyElementSelector: null,
      }
    );
    expect(results.length).toBe(2);
    expect(results).toStrictEqual(expectedResults);
  });

});
