import { currencies, Currency } from "../../types/Currency";


class CurrencyService {

    getCurrencyFromCurrencyCode(currencyCode: string): Currency {
        return currencies[currencyCode];
    }

    getCurrencyRepresentation(currencyCode: string) {
        return this.getCurrencyFromCurrencyCode(currencyCode).representation;
    }

    minorUnitsToMajorUnits(minorUnits: number, currency: Currency): number {
        return minorUnits / (1 * 10 ** currency.decimalPlaces);
    }

    minorUnitsToRelativeUnits(minorUnits: number, currency: Currency): number {
        return minorUnits / currency.conversionFactor;
    }

    majorUnitsToTextRepresentation(majorUnits: number, currency: Currency): string {
        return currency.representation + ' ' + majorUnits.toFixed(currency.decimalPlaces);
    }

}

const currencyService = new CurrencyService();

export default currencyService;