import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_ManaGaming } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_ManaGaming();
});

describe('PriceGetter_ManaGaming', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Mana Gaming');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      stub + 'https://managaming.shop/search?page=1&q=%2Asteam%20vents%2A',
      {"headers": {"Origin": "compare-the-magic"}}
    );
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults);
  });

});
