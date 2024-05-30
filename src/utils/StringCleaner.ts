
interface IStringCleaner {
    str: string,
    get: () => string,
}

export class StringCleaner implements IStringCleaner {

    str: string;

    constructor(str: string) {
        this.str = str;
    }

    get() {
        return this.str;
    }

    removeNewLines(): IStringCleaner {
        this.str = this.str.replace(/\n/g, '');
        return this;
    }

    removeNonDigits(): IStringCleaner {
        this.str = this.str.replace(/\D/g,'');
        return this;
    }

    removeSegmentInSquareBrackets(): IStringCleaner {
        this.str = this.str.replace(/(.*)\[(.*)\]/g, `$1`);
        return this;
    }

    selectSegmentInSquareBrackets(): IStringCleaner {
        this.str = this.str.replace(/(.*)\[(.*)\]/g, `$2`);
        return this;
    }

    trimWhitespace(): IStringCleaner {
        this.str = this.str.replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);
        return this;
    }

}