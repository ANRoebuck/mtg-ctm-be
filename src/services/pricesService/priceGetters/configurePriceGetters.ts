import {
    IPriceGetterBehaviour,
    PriceGetter_401Games,
    PriceGetter_Axion,
    // PriceGetter_BazaarOfMagic,
    // PriceGetter_BigOrbitCards,
    PriceGetter_BoardsAndSwords,
    PriceGetter_CosmicCollectables,
    // PriceGetter_DiceSaloon,
    PriceGetter_FaceToFaceGames,
    PriceGetter_GameHQ,
    PriceGetter_GatheringPointGames,
    PriceGetter_GearheadGames,
    PriceGetter_Hareruya,
    PriceGetter_Harlequins,
    PriceGetter_HighlanderGames,
    // PriceGetter_LazyDragonGaming,
    PriceGetter_LondonMagicTraders,
    PriceGetter_LvlUp,
    PriceGetter_MagicCardTrader,
    PriceGetter_MagicMadhouse,
    // PriceGetter_ManaGaming,
    PriceGetter_Manaleak,
    PriceGetter_MightyLancer,
    // PriceGetter_MountbattenCollectables,
    PriceGetter_MrCardSingles,
    // PriceGetter_NerdShak,
    PriceGetter_PatriotGamesLeeds,
    PriceGetter_SkywardFire,
    PriceGetter_StarCityGames,
    PriceGetter_TotalCards,
    PriceGetter_TrollTrader,
    // PriceGetter_Untap,
    PriceGetter_WaypointGames,
} from './';
import CachingPriceGetter from './CachingPriceGetter';

const priceGetters: IPriceGetterBehaviour[] = [
    new PriceGetter_401Games(),
    new PriceGetter_Axion(),
    // Bazaar of Magic — HTML scraper using href-pattern selectors (no CSS class names needed).
    // Selectors unverified pending live test.
    // new PriceGetter_BazaarOfMagic(),
    // Big Orbit blocks automated searches
    // new PriceGetter_BigOrbitCards(),
    new PriceGetter_BoardsAndSwords(),
    // Want to add ChaosCards but currently unable due to lazy-loading and inaccessible API
    new PriceGetter_CosmicCollectables(),
    // Dice Saloon currently has no MTG singles in stock — getter updated to Shopify JSON API; re-enable when stock returns
    // new PriceGetter_DiceSaloon(),
    new PriceGetter_FaceToFaceGames(),
    new PriceGetter_GameHQ(),
    new PriceGetter_GatheringPointGames(),
    new PriceGetter_GearheadGames(),
    new PriceGetter_Hareruya(),
    new PriceGetter_Harlequins(),
    new PriceGetter_HighlanderGames(),
    // Lazy Dragon Gaming's site shows all cards as out of stock. Not sure if maintenance or shutting down
    // new PriceGetter_LazyDragonGaming(),
    new PriceGetter_LondonMagicTraders(),
    new PriceGetter_LvlUp(),
    new PriceGetter_MagicCardTrader(),
    new PriceGetter_MagicMadhouse(),
    // ManaGaming removed following repeated complaints from customers regarding poor service
    // new PriceGetter_ManaGaming(),
    new PriceGetter_Manaleak(),
    new PriceGetter_MightyLancer(),
    // Mountbatten's site appears to have closed down
    // new PriceGetter_MountbattenCollectables(),
    new PriceGetter_MrCardSingles(),
    // NerdShak removed following repeated complaints from customers regarding poor service
    // new PriceGetter_NerdShak(),
    new PriceGetter_PatriotGamesLeeds(),
    new PriceGetter_SkywardFire(),
    new PriceGetter_StarCityGames(),
    new PriceGetter_TotalCards(),
    new PriceGetter_TrollTrader(),
    // Untap (untap.cz) - Czech PrestaShop store. Selectors unverified; site is behind Cloudflare challenge.
    // new PriceGetter_Untap(),
    new PriceGetter_WaypointGames(),
];

const configurePriceGetters = (): { [key: string]: IPriceGetterBehaviour } => {

    const confiuredPriceGetters = priceGetters
        .map(priceGetter => new CachingPriceGetter(priceGetter))
        .reduce((acc: { [key: string]: IPriceGetterBehaviour }, ele: IPriceGetterBehaviour) => {
            acc[ele.name] = ele;
            return acc;
        }, {});

    console.log(`Configured ${priceGetters.length} priceGetters`);
    console.log(Object.keys(confiuredPriceGetters));

    return confiuredPriceGetters;
}

export default configurePriceGetters;
