import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_MagicMadhouse extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_MagicMadhouse extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_MagicMadhouse extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_MagicMadhouse extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_MagicMadhouse;
