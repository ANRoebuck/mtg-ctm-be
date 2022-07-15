import { Currency } from "../../types/Currency";


class CurrencyService {

    currencies: { [key: string]: Currency } = {
        EUR: { representation: '€', decimalPlaces: 2, conversionFactor: 1, },
        GBP: { representation: '£', decimalPlaces: 2, conversionFactor: 1, },
        JPY: { representation: '¥', decimalPlaces: 0, conversionFactor: 100, },
        USD: { representation: '$', decimalPlaces: 2, conversionFactor: 1, },
    }

    getCurrencyRepresentation(currencyCode: string) {
        return this.currencies.currencyCode.representation;
    }

    minorUnitsToMajorUnits(minorUnits: number, currencyCode: string): number {
        return minorUnits / (1 * 10 ^ this.currencies.currencyCode.decimalPlaces);
    }

    minorUnitsToRelativeUnits(minorUnits: number, currencyCode: string): number {
        return minorUnits / this.currencies.currencyCode.conversionFactor;
    }

    majorUnitsToTextRepresentation(majorUnits: number, currencyCode: string): string {
        const currency = this.currencies.currencyCode;
        return currency.representation + ' ' + majorUnits.toFixed(currency.decimalPlaces);
    }

}

const currencyService = new CurrencyService();

export default currencyService;