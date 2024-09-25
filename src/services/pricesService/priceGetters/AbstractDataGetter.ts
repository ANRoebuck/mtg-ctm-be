import axios from 'axios';
import { BE_URL_STUB } from '../../../gateway/http';


// axios.defaults.headers.common['origin'] = "CTM";

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

    getData = async (searchTerm: string) : Promise<string> => axios
        .get(this.searchTermToUrl(searchTerm), { 'headers': { 'Origin': 'compare-the-magic' } })
        .then(this.extractData)
        .catch((e) => {
            console.log(`Failed to get data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
            // console.log(e);
            return '';
        });

    searchTermToUrl = (searchTerm: string) => {
        const url = this.baseUrl
            + this.searchPath
            + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
            + this.searchSuffix;
        console.log('requesting data from ' + url);    
        return BE_URL_STUB + url;
    };

    extractData = ({ data } : { data: string }): string => data || '';
}

export default AbstractDataGetter;
