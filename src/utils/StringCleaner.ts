
interface IStringCleaner {
    str: string,
    get: () => string,
    removeLineBreakHtml: () => IStringCleaner,
    removeNewLines: () => IStringCleaner,
    removeNonDigits: () => IStringCleaner,
    removeSegmentInSquareBrackets: () => IStringCleaner,
    removeTrailingFOIL: () => IStringCleaner,
    removeWeirdBrackets: () => IStringCleaner,
    selectSegmentInSquareBrackets: () => IStringCleaner,
    splitOnSymbolAndSelectSection: (symbol: string, section: number) => IStringCleaner,
    trimWhitespace: () => IStringCleaner
}

export class StringCleaner implements IStringCleaner {

    str: string;

    constructor(str: string) {
        this.str = str;
    }

    get() {
        return this.str;
    }

    removeLineBreakHtml(): IStringCleaner {
        this.str = this.str.replace(/<br>/, '');
        return this;
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

    removeTrailingFOIL(): IStringCleaner {
        this.str = this.str.replace(/(.*)Foil/g, `$1`);
        return this;
    }

    removeWeirdBrackets(): IStringCleaner {
        this.str = this.str.replace(/[【】《》\[\]■ ◆]/g, ' ');
        return this;
    }

    selectSegmentInSquareBrackets(): IStringCleaner {
        this.str = this.str.replace(/(.*)\[(.*)\]/g, `$2`);
        return this;
    }

    splitOnSymbolAndSelectSection(symbol: string, section: number): IStringCleaner {
        this.str = this.str.split(symbol)[section];
        return this;
    }

    trimWhitespace(): IStringCleaner {
        this.str = this.str.replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);
        return this;
    }

}


// to check

// bigorbit
const textStringFromInnerHtml: RegExp = /(.|\n)*£([0-9]+).([0-9]{2})[\D]*/;

// harlequins
// stockvaluefromstocktext

