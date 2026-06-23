const DEV = 'development';
const PROD = 'propduction';
const TEST = 'test';


type LogMethod = (message: string) => void;

export class Logger {

    NODE_ENV: string;
    logMethod: LogMethod;

    constructor(logMethod: LogMethod) {
        this.NODE_ENV = process.env.NODE_ENV || DEV;
        this.logMethod = logMethod;
    }

    all(message: string) {
        this.logMethod(message);
    }

    dev(message: string) {
        if(this.NODE_ENV === DEV) {
            this.logMethod(message);
        }
    }

    prod(message: string) {
        if(this.NODE_ENV === PROD) {
            this.logMethod(message);
        }
    }

    test(message: string) {
        if(this.NODE_ENV === TEST) {
            this.logMethod(message);
        }
    }

    ENV() {
        this.logMethod(this.NODE_ENV);
    }
}

export const ts = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')} ${String(d.getMonth() + 1).padStart(2, '0')} ${d.getFullYear()}`;
};

export const testLogger = (logMethod: LogMethod) => new Logger(logMethod);

const logger = new Logger(console.log);

export const VERBOSE_LOGGING = true;

export default logger;