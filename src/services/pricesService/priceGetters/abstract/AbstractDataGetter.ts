import axios from 'axios';


// axios.defaults.headers.common['origin'] = "CTM";

interface Args {
    baseUrl: string,
    searchPath: string,
    searchSuffix: string,
    searchJoin: string,
}

abstract class AbstractDataGetter {

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

    searchTermToUrl = (searchTerm: string) => {
        const url = this.baseUrl
            + this.searchPath
            + searchTerm.toLowerCase().split(' ').join(this.searchJoin)
            + this.searchSuffix;
        console.log('requesting data from ' + url);    
        return this.cors + url;
    };

    extractData = ({ data } : { data: string }): string => data || '';
}

export default AbstractDataGetter;
