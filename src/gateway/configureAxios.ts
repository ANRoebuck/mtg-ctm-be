// https://stackoverflow.com/questions/51363855/how-to-configure-axios-to-use-ssl-certificate

import https from 'https';
import axios from 'axios';
import { ts } from '../utils/Logger';

const configureAxios = () => {

    // Disable only in development mode
    if (process.env.NODE_ENV === 'development') {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        })
        axios.defaults.httpsAgent = httpsAgent;
        console.warn(`[${ts()}] [configureAxios] NODE_ENV=[${process.env.NODE_ENV}], RejectUnauthorized is disabled.`);
    }
};

export default configureAxios;

