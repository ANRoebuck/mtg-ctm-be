import axios from 'axios';
import { MTG_CTM_CORS_ANYWHERE } from '../../../gateway/http';


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
        // .get(this.searchTermToUrl(searchTerm))
        .then(this.extractData)
        .catch((e) => {
            console.log(`Failed to get data for seller=[${this.name}] searchTerm=[${searchTerm}]`);
            console.log(e);
            return '';
        });

    searchTermToUrl = (searchTerm: string) => {
        const url = this.baseUrl
            + this.searchPath
            + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
            + this.searchSuffix;
        console.log('Requesting data from ' + url);    
        return MTG_CTM_CORS_ANYWHERE + url;
    };

    extractData = ({ data } : { data: string }): string => {
        console.log('Extracting data');
        return data || '';
    }
}

export default AbstractDataGetter;
