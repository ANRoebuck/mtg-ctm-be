import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { BE_URL_STUB } from '../../../../gateway/http';

import { PriceGetter_SkywardFire } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_SkywardFire();
});

describe('PriceGetter_SkywardFire', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Skyward Fire');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      BE_URL_STUB + 'https://www.skywardfire.com/products/search?q=steam+vents',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(5);
    expect(results).toStrictEqual(expectedResults);
  });

  it('gets results for Dromokas Command', async () => {
    const searchTerm = 'Dromokas Command';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      BE_URL_STUB + 'https://www.skywardfire.com/products/search?q=dromokas+command',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(5);
    expect(results).toStrictEqual(expectedResults);
  });

});
