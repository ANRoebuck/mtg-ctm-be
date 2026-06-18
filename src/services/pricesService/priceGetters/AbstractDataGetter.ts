import axios from 'axios';
import { MTG_CTM_CORS_ANYWHERE } from '../../../gateway/http';
import { VERBOSE_LOGGING } from '../../../utils/Logger';


interface Args {
    name: string,
    baseUrl: string,
    searchPath: string,
    searchSuffix: string,
    searchJoin: string,
}

abstract class AbstractDataGetter {

    name: string;
    baseUrl: string;
    searchPath: string;
    searchSuffix: string;
    searchJoin: string;

    constructor( { name, baseUrl, searchPath, searchSuffix, searchJoin } : Args ) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.searchPath = searchPath;
        this.searchSuffix = searchSuffix;
        this.searchJoin = searchJoin;
    }

    getData = async (searchTerm: string) : Promise<any> => axios
        .get(this.searchTermToUrl(searchTerm), { 'headers': { 'Origin': 'compare-the-magic' } })
        // .get(this.searchTermToUrl(searchTerm))
        .then((response) => this.extractData(response, searchTerm))
        .catch((e) => this.handleDataError(searchTerm, e));

    protected handleDataError = (searchTerm: string, e: unknown): '' => {
        console.error(`Failed to get data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
        if (axios.isAxiosError(e)) {
            console.error(`[${e.code ?? 'UNKNOWN'}] ${e.message} (HTTP ${e.response?.status ?? 'N/A'}, url=${e.config?.url})`);
        } else {
            console.error(e);
        }
        return '';
    }

    searchTermToUrl = (searchTerm: string) => {
        const url = this.baseUrl
            + this.searchPath
            + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
            + this.searchSuffix;
        if (VERBOSE_LOGGING) console.log('Requesting data from ' + url);
        return MTG_CTM_CORS_ANYWHERE + url;
    };

    extractData = ({ data } : { data: any }, searchTerm: string): any => {
        console.log(`Extracting data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
        return data ?? '';
    }
}

export default AbstractDataGetter;
