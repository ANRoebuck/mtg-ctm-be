import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_MagicCardTrader extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_MagicCardTrader extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_MagicCardTrader extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_MagicCardTrader extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_MagicCardTrader;
