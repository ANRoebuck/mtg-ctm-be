

class AbstractDataGetter {

    cors: string
    baseUrl: string
    searchPath: string
    searchSuffix: string
    searchJoin: string

    constructor( cors: string, baseUrl: string, searchPath: string, searchSuffix: string, searchJoin: string ) {
        this.cors = cors;
        this.baseUrl = baseUrl;
        this.searchPath = searchPath;
        this.searchSuffix = searchSuffix;
        this.searchJoin = searchJoin;
    }

    getData = async (searchTerm: string) : Promise<string> => {

        return '';
    }
}

export default AbstractDataGetter;
