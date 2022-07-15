import { Currency } from "../../types/Currency";


class CurrencyService {

    currencies: { [key: string]: Currency } = {
        EUR: { representation: '€', decimalPlaces: 2, conversionFactor: 1, },
        GBP: { representation: '£', decimalPlaces: 2, conversionFactor: 1, },
        JPY: { representation: '¥', decimalPlaces: 0, conversionFactor: 100, },
        USD: { representation: '$', decimalPlaces: 2, conversionFactor: 1, },
    }

    getCurrencyFromCurrencyCode(currencyCode: string): Currency {
        return this.currencies[currencyCode];
    }

    getCurrencyRepresentation(currencyCode: string) {
        return this.getCurrencyFromCurrencyCode(currencyCode).representation;
    }

    minorUnitsToMajorUnits(minorUnits: number, currencyCode: string): number {
        return minorUnits / (1 * 10 ** this.getCurrencyFromCurrencyCode(currencyCode).decimalPlaces);
    }

    minorUnitsToRelativeUnits(minorUnits: number, currencyCode: string): number {
        return minorUnits / this.getCurrencyFromCurrencyCode(currencyCode).conversionFactor;
    }

    majorUnitsToTextRepresentation(majorUnits: number, currencyCode: string): string {
        const currency = this.getCurrencyFromCurrencyCode(currencyCode);
        return currency.representation + ' ' + majorUnits.toFixed(currency.decimalPlaces);
    }

}

const currencyService = new CurrencyService();

export default currencyService;