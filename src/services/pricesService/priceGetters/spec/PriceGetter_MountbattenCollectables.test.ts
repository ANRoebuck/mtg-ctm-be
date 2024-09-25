import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { BE_URL_STUB } from '../../../../gateway/http';

import { PriceGetter_MountbattenCollectables } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_MountbattenCollectables();
});

describe('PriceGetter_MountbattenCollectables', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Mountbatten Collectables');
  });

  it('gets results for Go for the Throat', async () => {
    const searchTerm = 'Go for the Throat';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      BE_URL_STUB + 'https://www.mountbattencollectables.com/products/search?q=go+for+the+throat',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults);
  });

});
