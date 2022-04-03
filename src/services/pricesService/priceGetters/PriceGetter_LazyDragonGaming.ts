import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_LazyDragonGaming extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_LazyDragonGaming extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_LazyDragonGaming extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_LazyDragonGaming extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_LazyDragonGaming;
