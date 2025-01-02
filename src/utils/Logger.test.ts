import { testLogger, Logger } from "./Logger";

const DEV = 'development';
const PROD = 'propduction';
const TEST = 'test';

const logMethod = jest.fn();

let logger: Logger;

describe('logger', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        logger = testLogger(logMethod);
    });

    it('foo', () => {
        logger.all('logging foo');
        logger.ENV();
        console.log(process.env.NODE_ENV);

        expect(logMethod).toHaveBeenCalledWith(TEST);
    });
});