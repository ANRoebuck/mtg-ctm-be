import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { MTG_CTM_CORS_ANYWHERE } from '../../../../gateway/http';

import { PriceGetter_HighlanderGames } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_HighlanderGames();
});

describe('PriceGetter_HighlanderGames', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Highlander Games');
  });

  it('gets results for Tarmogoyf', async () => {
    const searchTerm = 'Tarmogoyf';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      MTG_CTM_CORS_ANYWHERE + 'https://highlandergames.co.uk/search?type=product&q=search?type=product&q=tarmogoyf',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(3);
    expect(results).toStrictEqual(expectedResults);
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      MTG_CTM_CORS_ANYWHERE + 'https://highlandergames.co.uk/search?type=product&q=search?type=product&q=steam+vents',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(1);
    expect(results).toStrictEqual(expectedResults);
  });

});
