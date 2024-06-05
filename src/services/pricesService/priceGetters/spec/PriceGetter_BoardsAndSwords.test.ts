import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_BoardsAndSwords } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const stub = 'https://mtg-shelf.herokuapp.com/';

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_BoardsAndSwords();
});

describe('PriceGetter_BoardsAndSwords', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Boards & Swords');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      stub + 'https://www.boardsandswords.co.uk/search?type=product&options%5Bprefix%5D=last&q=steam+vents',
      {"headers": {"Origin": "compare-the-magic"}}
    );
    expect(results.length).toBe(1);
    expect(results).toStrictEqual(expectedResults);
  });

});
