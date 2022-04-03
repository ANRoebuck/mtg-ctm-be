import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_Hareruya extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_Hareruya extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_Hareruya extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_Hareruya extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_Hareruya;
