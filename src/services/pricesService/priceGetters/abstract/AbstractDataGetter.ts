import axios from 'axios';

interface Args {
    baseUrl: string,
    searchPath: string,
    searchSuffix: string,
    searchJoin: string,
}

class AbstractDataGetter {

    cors: string = 'https://mtg-shelf.herokuapp.com/';
    baseUrl: string;
    searchPath: string;
    searchSuffix: string;
    searchJoin: string;

    constructor( { baseUrl, searchPath, searchSuffix, searchJoin } : Args ) {
        this.baseUrl = baseUrl;
        this.searchPath = searchPath;
        this.searchSuffix = searchSuffix;
        this.searchJoin = searchJoin;
    }

    getData = async (searchTerm: string) : Promise<string> => axios
        .get(this.searchTermToUrl(searchTerm))
        .then(this.extractData)
        .catch(() => '');

    searchTermToUrl = (searchTerm: string) => this.cors
        + this.baseUrl + this.searchPath
        + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
        + this.searchSuffix;

    extractData = ({ data } : { data: string }) => data || '';
}

export default AbstractDataGetter;
