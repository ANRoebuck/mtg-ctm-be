import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';
import { BE_URL_STUB } from '../../../../gateway/http';

import { PriceGetter_StarCityGames } from '..';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_StarCityGames();
});

describe('PriceGetter_StarCityGames', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Star City Games');
  });

  it('gets results for Steam Vents', async () => {
    const searchTerm = 'Steam Vents';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.post.mockResolvedValueOnce({ data: JSON.parse(htmlString) });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://essearchapi-na.hawksearch.com/api/v2/search',
      {
        'Keyword': 'steam vents',
        'Variant': { 'Origin': 'compare-the-magic' },
        'SortBy': 'score',
        'FacetSelections': { 'variant_instockonly': ['Yes'] },
        'MaxPerPage': 24,
        'clientguid': 'cc3be22005ef47d3969c3de28f09571b'
      }
    );

    expect(results.length).toBe(9);
    expect(results).toStrictEqual(expectedResults);
  });

});
