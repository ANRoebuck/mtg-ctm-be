import axios from 'axios';
import { response_axion_Tarmogoyf, expectedResults_axion_Tarmogoyf } from './test-resources/model-axion-search-response-tarmogoyf';
import PriceGetter_Axion from '../PriceGetter_Axion';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;


describe('PriceGetter_Axion', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_axion_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_Axion();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Axion Now');
    expect(results.length).toBe(12);
    expect(results).toStrictEqual(expectedResults_axion_Tarmogoyf);
  });

});
