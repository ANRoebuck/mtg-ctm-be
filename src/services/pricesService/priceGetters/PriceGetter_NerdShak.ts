import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_NerdShak extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_NerdShak extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_NerdShak extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_NerdShak extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_NerdShak;
