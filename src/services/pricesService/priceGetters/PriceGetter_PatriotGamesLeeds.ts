import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_PatriotGamesLeeds extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_PatriotGamesLeeds extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_PatriotGamesLeeds extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_PatriotGamesLeeds extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_PatriotGamesLeeds;
