import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_LvlUp extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_LvlUp extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_LvlUp extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_LvlUp extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_LvlUp;
