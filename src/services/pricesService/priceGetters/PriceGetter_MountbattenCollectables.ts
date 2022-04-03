import AbstractDataGetter from './abstract/AbstractDataGetter';
import AbstractDataProcessor from './abstract/AbstractDataProcessor';
import AbstractPriceGetter from './abstract/AbstractPriceGetter';
import AbstractProcessorSelector from './abstract/AbstractProcessorSelector';


class PriceGetter_MountbattenCollectables extends AbstractPriceGetter {
    constructor() {
        super();
    }
}

class DataGetter_MountbattenCollectables extends AbstractDataGetter {
    constructor() {
        super();
    }
}

class ProcessorSelector_MountbattenCollectables extends AbstractProcessorSelector {
    constructor() {
        super();
    }
}

class DataProcessor_MountbattenCollectables extends AbstractDataProcessor {
    constructor() {
        super();
    }
}

export default PriceGetter_MountbattenCollectables;
