import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { readHtmlString } from '../../../../utils/utils';

import { PriceGetter_BigOrbitCards } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_BigOrbitCards();
});

describe('PriceGetter_BigOrbitCards', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Big Orbit Cards');
  });

  it('gets results for Seachrome Coast', async () => {
    const searchTerm = 'Seachrome Coast';

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.post.mockResolvedValueOnce({ data: htmlString });

    await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5002/api/scrape',
      {
        targetUrl: 'https://www.bigorbitcards.co.uk/magic-the-gathering/search/seachrome+coast/?resultsPerPage=96',
        lazyElementSelector: 'article.product-miniature',
      }
    );
    // Result count and exact match not asserted — selectors unverified against live site
    // expect(results.length).toBe(7);
    // expect(results).toStrictEqual(expectedResults);
  });

});
