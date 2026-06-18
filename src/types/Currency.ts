export type Currency = {
    representation: string,
    decimalPlaces: number,
    conversionRate: number,
}

// conversionRate: converts minor units of this currency to GBP-pence-equivalent relative units.
// Formula: relativeUnits = minorUnits / conversionRate
// Calibrated so that £1 (100 GBP pence) = 100 relative units in any currency.
// conversionRate = (units of this currency per £1) for 2dp currencies; divide by 100 for 0dp (JPY).
// These values are the defaults used to initialise CurrencyService at startup (rates as of 2026-03-10).
// To update rates at runtime, use CurrencyService.setConversionRate(s) — this object is not mutated.
export const currencies: { [key: string]: Currency } = {
    CAD: { representation: 'CA$', decimalPlaces: 2, conversionRate: 1.83, },
    CZK: { representation: 'Kč', decimalPlaces: 2, conversionRate: 28.2, },
    EUR: { representation: '€', decimalPlaces: 2, conversionRate: 1.16, },
    GBP: { representation: '£', decimalPlaces: 2, conversionRate: 1, },
    JPY: { representation: '¥', decimalPlaces: 0, conversionRate: 2.12, },
    NZD: { representation: 'NZ$', decimalPlaces: 2, conversionRate: 2.26, },
    USD: { representation: '$', decimalPlaces: 2, conversionRate: 1.35, },
}
