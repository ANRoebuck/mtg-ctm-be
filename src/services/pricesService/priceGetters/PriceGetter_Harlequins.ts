import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_Harlequins extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_Harlequins extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_Harlequins extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_Harlequins extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_Harlequins;
