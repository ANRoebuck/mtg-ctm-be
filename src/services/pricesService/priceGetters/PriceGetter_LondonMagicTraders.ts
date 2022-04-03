import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_LondonMagicTraders extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_LondonMagicTraders extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_LondonMagicTraders extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_LondonMagicTraders extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_LondonMagicTraders;
