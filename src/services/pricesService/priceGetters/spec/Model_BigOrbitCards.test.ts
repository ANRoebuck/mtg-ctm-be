import axios, {AxiosStatic} from 'axios';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import PriceGetter_BigOrbitCards from "../PriceGetter_BigOrbitCards";
import {
  expectedResults_bigOrbit_Tarmogoyf,
  response_bigOrbit_Tarmogoyf
} from './test-resources/model-big-orbit-cards-response-tarmogoyf';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;


describe('PriceGetter_BigOrbitCards', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_bigOrbit_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_BigOrbitCards();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Big Orbit Cards');
    expect(results.length).toBe(12);
    expect(results).toStrictEqual(expectedResults_bigOrbit_Tarmogoyf);
  });

});
