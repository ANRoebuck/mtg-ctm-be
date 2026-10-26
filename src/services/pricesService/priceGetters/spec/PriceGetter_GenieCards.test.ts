import axios, { AxiosStatic } from 'axios';
import { IPriceGetterBehaviour } from '../AbstractPriceGetter';
import { Price } from '../../../../types/Price';
import { readHtmlString, readResults } from '../../../../utils/utils';

import { PriceGetter_GenieCards } from '..';
import { parseGenieTitle } from '../PriceGetter_GenieCards';


jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

let priceGetter: IPriceGetterBehaviour;

beforeEach(() => {
  jest.clearAllMocks();
  priceGetter = new PriceGetter_GenieCards();
});

describe('PriceGetter_GenieCards', () => {

  it('has correct seller name', () => {
    expect(priceGetter.name).toBe('Genie Cards');
  });

  it('gets results for Hallowed Fountain', async () => {
    const searchTerm = 'Hallowed Fountain';

    const expectedResults = readResults(priceGetter.name, searchTerm);

    const htmlString = readHtmlString(priceGetter.name, searchTerm);
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices(searchTerm, false);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.geniecards.co.uk/search?q=hallowed+fountain',
      { "headers": { "Origin": "compare-the-magic" } }
    );
    expect(results).toStrictEqual(expectedResults);
  });

  it('excludes out of stock and non-near-mint listings', async () => {
    const htmlString = readHtmlString(priceGetter.name, 'Hallowed Fountain');
    mockedAxios.get.mockResolvedValueOnce({ data: htmlString });

    const results: Price[] = await priceGetter.getPrices('Hallowed Fountain', false);

    const refs = results.map(r => r.productRef.split('/').pop());
    // in stock + NM
    expect(refs).toContain('hallowed-fountain-dis-174-nm-mtg');
    expect(refs).toContain('hallowed-fountain-rna-251-foil-nm-mtg');
    // in stock but EX
    expect(refs).not.toContain('hallowed-fountain-prna-251p-foil-ex-mtg');
    // NM but out of stock
    expect(refs).not.toContain('hallowed-fountain-rna-251-nm-mtg');
    expect(refs).not.toContain('hallowed-fountain-rvr-404-nm-mtg');
    expect(results.every(r => r.stock_inStock)).toBe(true);
  });

});


describe('parseGenieTitle', () => {

  it('splits a plain title', () => {
    expect(parseGenieTitle('Hallowed Fountain - DIS - 174 - NM - MTG')).toStrictEqual({
      name: 'Hallowed Fountain', set: 'DIS', collectorNumber: '174', treatments: [], condition: 'NM',
    });
  });

  it('reads foil and other treatments', () => {
    expect(parseGenieTitle('Hallowed Fountain - RVR - 295 - Borderless - Foil - NM - MTG')).toStrictEqual({
      name: 'Hallowed Fountain', set: 'RVR', collectorNumber: '295', treatments: ['Borderless', 'Foil'], condition: 'NM',
    });
    expect(parseGenieTitle('Hallowed Fountain - ECL - 265 - Foil - NM - MTG')?.treatments).toStrictEqual(['Foil']);
    expect(parseGenieTitle('Foo - SLD - 123 - Secret Lair - EX - MTG')).toMatchObject({ treatments: ['Secret Lair'], condition: 'EX' });
  });

  it('handles letter-suffixed collector numbers', () => {
    expect(parseGenieTitle('Hallowed Fountain - PRNA - 251p - Foil - EX - MTG')).toMatchObject({ set: 'PRNA', collectorNumber: '251p' });
  });

  it('handles SET-NUMBER collector numbers (promo packs)', () => {
    expect(parseGenieTitle('Fire // Ice - PLST - UMA-225 - NM - MTG')).toStrictEqual({
      name: 'Fire // Ice', set: 'PLST', collectorNumber: 'UMA-225', treatments: [], condition: 'NM',
    });
  });

  it('keeps punctuation in names and splits on the set/number, not on every dash', () => {
    expect(parseGenieTitle("Kiki-Jiki, Mirror Breaker - PLST - MM2-121 - NM - MTG")?.name).toBe('Kiki-Jiki, Mirror Breaker');
    expect(parseGenieTitle('Emeritus of Conflict // Lightning Bolt - SOS - 113 - Foil - NM - MTG')).toMatchObject({
      name: 'Emeritus of Conflict // Lightning Bolt', set: 'SOS', treatments: ['Foil'],
    });
  });

  it('handles a card name that itself contains " - "', () => {
    expect(parseGenieTitle('Foo - Bar - SLD - 12 - NM - MTG')).toMatchObject({ name: 'Foo - Bar', set: 'SLD', collectorNumber: '12' });
  });

  it('returns null for an unrecognised format', () => {
    expect(parseGenieTitle('Some Sealed Product')).toBeNull();
    expect(parseGenieTitle('Booster Box - Foo - NM - MTG')).toBeNull();
  });

});
