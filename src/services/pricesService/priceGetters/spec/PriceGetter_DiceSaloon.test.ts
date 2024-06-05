import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_DiceSaloon } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_DiceSaloon();
});

describe('PriceGetter_DiceSaloon', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Dice Saloon');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      stub + 'https://www.dicesaloonsingles.co.uk/search?options%5Bprefix%5D=last&type=product&q=steam+vents',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results.length).toBe(2);
    expect(results).toStrictEqual(expectedResults);
  });

});
