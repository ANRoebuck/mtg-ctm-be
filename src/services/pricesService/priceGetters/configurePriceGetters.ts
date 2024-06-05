import {
    IPriceGetterBehaviour,
    PriceGetter_Axion,
    PriceGetter_BigOrbitCards,
    PriceGetter_BoardsAndSwords,
    PriceGetter_DiceSaloon,
    PriceGetter_Hareruya,
    PriceGetter_Harlequins,
    PriceGetter_HighlanderGames,
    // PriceGetter_LazyDragonGaming,
    PriceGetter_LondonMagicTraders,
    PriceGetter_LvlUp,
    PriceGetter_MagicCardTrader,
    PriceGetter_MagicMadhouse,
    PriceGetter_ManaGaming,
    PriceGetter_Manaleak,
    PriceGetter_MountbattenCollectables,
    // PriceGetter_NerdShak,
    PriceGetter_PatriotGamesLeeds,
    PriceGetter_SkywardFire,
    PriceGetter_StarCityGames,
    PriceGetter_TrollTrader
} from './';

const priceGettersArray: IPriceGetterBehaviour[] = [
    new PriceGetter_Axion(),
    new PriceGetter_BigOrbitCards(),
    new PriceGetter_BoardsAndSwords,
    new PriceGetter_DiceSaloon(),
    new PriceGetter_Hareruya(),
    new PriceGetter_Harlequins(),
    new PriceGetter_HighlanderGames(),
    // Lazy Dragon Gaming's site shows all cards as out of stock. Not sure if maintenance or shutting down
    // new PriceGetter_LazyDragonGaming(),
    new PriceGetter_LondonMagicTraders(),
    new PriceGetter_LvlUp(),
    new PriceGetter_MagicCardTrader(),
    new PriceGetter_MagicMadhouse(),
    new PriceGetter_ManaGaming(),
    new PriceGetter_Manaleak(),
    new PriceGetter_MountbattenCollectables(),
    // Nerd Shack have been removed following repeated complaints from customers regarding poor service
    // new PriceGetter_NerdShak(),
    new PriceGetter_PatriotGamesLeeds(),
    new PriceGetter_SkywardFire(),
    new PriceGetter_StarCityGames(),
    new PriceGetter_TrollTrader(),
];

const configurePriceGetters = (): { [key: string]: IPriceGetterBehaviour } => {
    
    const priceGetters = priceGettersArray.reduce((acc: { [key: string]: IPriceGetterBehaviour }, ele : IPriceGetterBehaviour) => {
        acc[ele.name] = ele;
        return acc;
    }, {});

    return priceGetters;
}

export default configurePriceGetters;
