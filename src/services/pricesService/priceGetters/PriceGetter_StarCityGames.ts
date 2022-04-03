import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_StarCityGames extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_StarCityGames extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_StarCityGames extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_StarCityGames extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_StarCityGames;
