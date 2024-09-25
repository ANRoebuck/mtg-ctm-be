import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { BE_URL_STUB } from '../../../../gateway/http';

import { PriceGetter_GameHQ } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_GameHQ();
});

describe('PriceGetter_GameHQ', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Game HQ');
  });

  it('gets results for Chrome Host Seedshark', async () => {
    const searchTerm = 'Chrome Host Seedshark';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      BE_URL_STUB + 'https://www.game-hq.co.uk/search?options%5Bprefix%5D=last&type=product&q=chrome+host+seedshark',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(1);
    expect(results).toStrictEqual(expectedResults);
  });

});
