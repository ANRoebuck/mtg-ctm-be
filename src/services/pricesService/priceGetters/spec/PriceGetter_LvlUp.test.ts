import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_LvlUp } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_LvlUp();
});

describe('PriceGetter_LvlUp', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Lvl Up Gaming');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.post.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:5002/api/scrape',
      {
        targetUrl: 'https://lvlupgaming.co.uk/search?type=product&options%5Bprefix%5D=last&q=steam+vents',
        lazyElementSelector: '.product-grid-container',
      }
    );
    expect(results.length).toBe(5);
    expect(results).toStrictEqual(expectedResults);
  });

});
