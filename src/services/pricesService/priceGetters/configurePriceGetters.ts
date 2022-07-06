import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import PriceGetter_Axion from './PriceGetter_Axion';
import PriceGetter_BigOrbitCards from './PriceGetter_BigOrbitCards';
import PriceGetter_Hareruya from './PriceGetter_Hareruya';
import PriceGetter_Harlequins from './PriceGetter_Harlequins';
import PriceGetter_LazyDragonGaming from './PriceGetter_LazyDragonGaming';
import PriceGetter_LondonMagicTraders from './PriceGetter_LondonMagicTraders';
import PriceGetter_LvlUp from './PriceGetter_LvlUp';
import PriceGetter_MagicCardTrader from './PriceGetter_MagicCardTrader';
import PriceGetter_MagicMadhouse from './PriceGetter_MagicMadhouse';
import PriceGetter_ManaLeak from './PriceGetter_ManaLeak';
import PriceGetter_MountbattenCollectables from './PriceGetter_MountbattenCollectables';
import PriceGetter_NerdShak from './PriceGetter_NerdShak';
import PriceGetter_PatriotGamesLeeds from './PriceGetter_PatriotGamesLeeds';
import PriceGetter_StarCityGames from './PriceGetter_StarCityGames';
import PriceGetter_TrollTrader from './PriceGetter_TrollTrader';

const configurePriceGetters = (): { [key: string]: AbstractPriceGetter } => {
    const priceGettersArray = [
        new PriceGetter_Axion(),
        new PriceGetter_BigOrbitCards(),
        new PriceGetter_Hareruya(),
        new PriceGetter_Harlequins(),
        new PriceGetter_LazyDragonGaming(),
        new PriceGetter_LondonMagicTraders(),
        new PriceGetter_LvlUp(),
        new PriceGetter_MagicCardTrader(),
        new PriceGetter_MagicMadhouse(),
        new PriceGetter_ManaLeak(),
        new PriceGetter_MountbattenCollectables(),
        new PriceGetter_NerdShak(),
        new PriceGetter_PatriotGamesLeeds(),
        new PriceGetter_StarCityGames(),
        new PriceGetter_TrollTrader(),
    ];

    return priceGettersArray.reduce((acc: { [key: string]: AbstractPriceGetter }, ele : AbstractPriceGetter) => {
        acc[ele.name]  = ele;
        return acc;
    }, {});
}

export default configurePriceGetters;
