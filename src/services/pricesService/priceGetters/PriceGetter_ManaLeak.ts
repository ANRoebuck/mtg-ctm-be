import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_ManaLeak extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_ManaLeak extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_ManaLeak extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_ManaLeak extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_ManaLeak;
