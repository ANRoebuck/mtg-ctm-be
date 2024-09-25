import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { BE_URL_STUB } from '../../../../gateway/http';

import { PriceGetter_GatheringPointGames } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_GatheringPointGames();
});

describe('PriceGetter_GatheringPointGames', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Gathering Point Games');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      BE_URL_STUB + 'https://gatheringpointgames.co.uk/search?type=product&options%5Bprefix%5D=last&q=steam+vents',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(7);
    expect(results).toStrictEqual(expectedResults);
  });

});
