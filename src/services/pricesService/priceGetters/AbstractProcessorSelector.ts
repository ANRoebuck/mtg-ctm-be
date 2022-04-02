import AbstractDataProcessor from './AbstractDataProcessor';

class AbstractProcessorSelector {

    dataProcessors: AbstractDataProcessor[]
    parser: DOMParser

    constructor(dataProcessors: AbstractDataProcessor[]) {
        this.dataProcessors = dataProcessors;
        this.parser = new DOMParser();
    }

    getProcessor = (rawData: string, searchTerm: string) : AbstractDataProcessor => this.dataProcessors[0];

}

export default AbstractProcessorSelector;
