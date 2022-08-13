import axios, { AxiosStatic } from 'axios';
import AbstractPriceGetter from '../abstract/AbstractPriceGetter';
import { Price } from '../../../../types/Price';

// import PriceGetters
import { PriceGetter_Axion, PriceGetter_BigOrbitCards, PriceGetter_Hareruya, PriceGetter_Harlequins, PriceGetter_LazyDragonGaming, PriceGetter_LondonMagicTraders, PriceGetter_LvlUp, PriceGetter_MagicCardTrader, PriceGetter_MagicMadhouse, PriceGetter_ManaLeak, PriceGetter_MountbattenCollectables, PriceGetter_NerdShak, PriceGetter_PatriotGamesLeeds, PriceGetter_StarCityGames, PriceGetter_TrollTrader } from '..';

// import test resources
import { response_axion_Tarmogoyf, expectedResults_axion_Tarmogoyf } from './test-resources/model-axion-search-response-tarmogoyf';
import { expectedResults_bigOrbit_Tarmogoyf, response_bigOrbit_Tarmogoyf } from './test-resources/model-big-orbit-cards-response-tarmogoyf';
import { expectedResults_hareruya_Tarmogoyf, response_hareruya_Tarmogoyf } from './test-resources/model-hareruya-search-response-tarmogoyf';
import { expectedResults_harlequins_ScaldingTarn, response_harlequins_ScaldingTarn } from './test-resources/model-harlequins-search-response-scalding-tarn';
import { expectedResults_harlequins_Tarmogoyf, response_harlequins_Tarmogoyf } from './test-resources/model-harlequins-search-response-tarmogoyf';
import { expectedResults_lazyDragonGaming_ShipwreckMarsh, response_lazyDragonGaming_ShipwreckMarsh } from './test-resources/model-lazy-dragon-gaming-search-response-shipwreck-marsh';
import { expectedResults_lvlUp_MistyRainforest, response_lvlUp_MistyRainforest } from './test-resources/model-lvl-up-search-response-misty-rainforest';
import { response_magicCardTrader_Tarmogoyf, expectedResults_magicCardTrader_Tarmogoyf } from './test-resources/model-magic-card-trader-response-tarmogoyf';
import { response_magicMadhouse_Tarmogoyf, expectedResults_magicMadhouse_Tarmogoyf } from './test-resources/model-magic-madhouse-response-tarmogoyf';
import { response_magicMadhouse_RavenFamiliar, expectedResults_magicMadhouse_RavenFamiliar } from "./test-resources/model-magic-madhouse-response-raven-familiar";
import { response_manaLeak_Tarmogoyf, expectedResults_manaLeak_Tarmogoyf } from './test-resources/model-mana-leak-response-tarmogoyf';
import { response_mountbattenCollectables_ScaldingTarn, expectedResults_mountbattenCollectables_ScaldingTarn } from './test-resources/model-mount-batten-response-scalding-tarn';
import { expectedResults_nerdShak_WateryGrave, response_nerdShak_WateryGrave } from './test-resources/model-nerd-shak-search-response-watery-grave';
import { response_patriotGamesLeeds_Tarmogoyf, expectedResults_patriotGamesLeeds_Tarmogoyf } from './test-resources/model-patriot-games-leeds-response-tarmogoyf';
import { response_starCityGames_Tarmogoyf, expectedResults_starCityGames_Tarmogoyf, foo} from "./test-resources/model-star-city-games-response-tarmogoyf";
import { expectedResults_starCityGames_RavenFamiliar, response_starCityGames_RavenFamiliar } from './test-resources/model-star-city-games-response-raven-familiar';
import { response_trollTrader_Tarmogoyf, expectedResults_trollTrader_Tarmogoyf } from './test-resources/model-troll-trader-response-tarmogoyf';



jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;


describe('PriceGetter_Axion', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_axion_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_Axion();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Axion Now');
    expect(results.length).toBe(2);
    expect(results).toStrictEqual(expectedResults_axion_Tarmogoyf);
  });

});


describe('PriceGetter_BigOrbitCards', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_bigOrbit_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_BigOrbitCards();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Big Orbit Cards');
    expect(results.length).toBe(0);
    expect(results).toStrictEqual(expectedResults_bigOrbit_Tarmogoyf);
  });

});


describe('PriceGetter_Hareruya', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_hareruya_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_Hareruya();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Hareruya');
    expect(results.length).toBe(24);
    expect(results).toStrictEqual(expectedResults_hareruya_Tarmogoyf);
  });

});


describe('PriceGetter_Harlequins', () => {

  it('gets results for Scalding Tarn', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_harlequins_ScaldingTarn });

    const priceGetter: AbstractPriceGetter =  new PriceGetter_Harlequins();
    const results: Price[] = await priceGetter.search('Scalding Tarn');

    expect(priceGetter.name).toBe('Harlequins');
    expect(results.length).toBe(4);
    expect(results).toStrictEqual(expectedResults_harlequins_ScaldingTarn);
  });

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_harlequins_Tarmogoyf });

    const priceGetter: AbstractPriceGetter =  new PriceGetter_Harlequins();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Harlequins');
    expect(results.length).toBe(3);
    expect(results).toStrictEqual(expectedResults_harlequins_Tarmogoyf);
  });

});


describe('PriceGetter_LazyDragonGaming', () => {

  it('gets results for Shipwreck Marsh', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_lazyDragonGaming_ShipwreckMarsh });

    const priceGetter: AbstractPriceGetter =  new PriceGetter_LazyDragonGaming();
    const results: Price[] = await priceGetter.search('Shipwreck Marsh');

    expect(priceGetter.name).toBe('Lazy Dragon Gaming');
    expect(results.length).toBe(3);
    expect(results).toStrictEqual(expectedResults_lazyDragonGaming_ShipwreckMarsh);
  });

});


describe('PriceGetter_LvlUp', () => {

  it('gets results for Misty Rainforest', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_lvlUp_MistyRainforest });

    const priceGetter: AbstractPriceGetter = new PriceGetter_LvlUp();
    const results: Price[] = await priceGetter.search('Misty Rainforest');

    expect(priceGetter.name).toBe('Lvl Up Gaming');
    expect(results.length).toBe(3);
    expect(results).toStrictEqual(expectedResults_lvlUp_MistyRainforest);
  });

});


describe('PriceGetter_MagicCardTrader', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_magicCardTrader_Tarmogoyf });

    const priceGetter: AbstractPriceGetter =  new PriceGetter_MagicCardTrader();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Magic Card Trader');
    expect(results.length).toBe(10);
    expect(results).toStrictEqual(expectedResults_magicCardTrader_Tarmogoyf);
  });

});


describe('PriceGetter_MagicMadhouse', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_magicMadhouse_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_MagicMadhouse();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Magic Madhouse');
    expect(results.length).toBe(13);
    expect(results).toStrictEqual(expectedResults_magicMadhouse_Tarmogoyf);
  });

  it('gets results for Raven Familiar', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_magicMadhouse_RavenFamiliar });

    const priceGetter: AbstractPriceGetter = new PriceGetter_MagicMadhouse();
    const results: Price[] = await priceGetter.search('Raven Familiar');

    expect(priceGetter.name).toBe('Magic Madhouse');
    expect(results.length).toBe(3);
    expect(results).toStrictEqual(expectedResults_magicMadhouse_RavenFamiliar);
  });

});


describe('PriceGetter_ManaLeak', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_manaLeak_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_ManaLeak();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Manaleak');
    expect(results.length).toBe(13);
    expect(results).toStrictEqual(expectedResults_manaLeak_Tarmogoyf);
  });

});


describe('PriceGetter_MountbattenCollectables', () => {

  it('gets results for Scalding Tarn', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_mountbattenCollectables_ScaldingTarn });

    const priceGetter: AbstractPriceGetter = new PriceGetter_MountbattenCollectables();
    const results: Price[] = await priceGetter.search('Scalding Tarn');

    expect(priceGetter.name).toBe('Mountbatten Collectables');
    expect(results.length).toBe(2);
    expect(results).toStrictEqual(expectedResults_mountbattenCollectables_ScaldingTarn);
  });

});


describe('PriceGetter_NerdShak', () => {

  it('gets results for Watery Grave', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_nerdShak_WateryGrave });

    const priceGetter: AbstractPriceGetter = new PriceGetter_NerdShak();
    const results: Price[] = await priceGetter.search('Watery Grave');

    expect(priceGetter.name).toBe('Nerd Shak');
    expect(results.length).toBe(6);
    expect(results).toStrictEqual(expectedResults_nerdShak_WateryGrave);
  });

});


describe('PriceGetter_PatriotGamesLeeds', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValue({ data: response_patriotGamesLeeds_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_PatriotGamesLeeds();
    const results: Price[] = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Patriot Games Leeds');
    expect(results.length).toBe(12);
    expect(results).toStrictEqual(expectedResults_patriotGamesLeeds_Tarmogoyf);
  });

});


// describe('PriceGetter_StarCityGames', () => {

//   it('gets results for Tarmogoyf', async () => {
//     mockedAxios.get.mockResolvedValueOnce({ data: response_starCityGames_Tarmogoyf });

//     const priceGetter: AbstractPriceGetter = new PriceGetter_StarCityGames();
//     const results: Price[] = await priceGetter.search('Tarmogoyf');

//     expect(priceGetter.name).toBe('Star City Games');
//     expect(results.length).toBe(21);
//     expect(results).toStrictEqual(expectedResults_starCityGames_Tarmogoyf);
//   });

//   it('gets results for Raven Familiar', async () => {
//     mockedAxios.get.mockResolvedValueOnce({ data: response_starCityGames_RavenFamiliar });

//     const priceGetter: AbstractPriceGetter = new PriceGetter_StarCityGames();
//     const results: Price[] = await priceGetter.search('Raven Familiar');

//     expect(priceGetter.name).toBe('Star City Games');
//     expect(results.length).toBe(3);
//     expect(results).toStrictEqual(expectedResults_starCityGames_RavenFamiliar);
//   });

// });


describe('PriceGetter_TrollTrader', () => {

  it('gets results for Tarmogoyf', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: response_trollTrader_Tarmogoyf });

    const priceGetter: AbstractPriceGetter = new PriceGetter_TrollTrader();
    const results = await priceGetter.search('Tarmogoyf');

    expect(priceGetter.name).toBe('Troll Trader');
    expect(results.length).toBe(7);
    expect(results).toStrictEqual(expectedResults_trollTrader_Tarmogoyf);
  });

});