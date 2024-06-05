import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_LondonMagicTraders } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_LondonMagicTraders();
});

describe('PriceGetter_LondonMagicTraders', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('London Magic Traders');
  });

  it('gets results for Hallowed Fountain', async () => {
    const searchTerm = 'Hallowed Fountain';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      stub + 'https://londonmagictraders.com/search?q=hallowed+fountain&options%5Bprefix%5D=last&filter.v.availability=1',
      {"headers": {"Origin": "compare-the-magic"}}
    );
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults);
  });

});
