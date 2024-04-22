export type Currency = {
    representation: string,
    decimalPlaces: number,
    conversionFactor: number,
}

export const currencies: { [key: string]: Currency } = {
    EUR: { representation: '€', decimalPlaces: 2, conversionFactor: 1, },
    GBP: { representation: '£', decimalPlaces: 2, conversionFactor: 1, },
    JPY: { representation: '¥', decimalPlaces: 0, conversionFactor: 100, },
    USD: { representation: '$', decimalPlaces: 2, conversionFactor: 1, },
}