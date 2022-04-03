import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_TrollTrader extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_TrollTrader extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_TrollTrader extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_TrollTrader extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_TrollTrader;
