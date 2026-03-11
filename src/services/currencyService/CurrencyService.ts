import axios from 'axios';
import { currencies, Currency } from "../../types/Currency";
import { EXCHANGE_RATE_API_URL } from "../../gateway/http";


class CurrencyService {

    private readonly currencies: { [key: string]: Currency };
    private conversionRates: Map<Currency, number>;

    private static readonly REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

    constructor(currencyMap: { [key: string]: Currency }) {
        this.currencies = currencyMap;
        this.conversionRates = new Map(
            Object.values(currencyMap).map(currency => [currency, currency.conversionRate])
        );

        this.fetchAndUpdateConversionRates();
        setInterval(() => this.fetchAndUpdateConversionRates(), CurrencyService.REFRESH_INTERVAL_MS).unref();
    }

    getCurrencyFromCurrencyCode(currencyCode: string): Currency {
        return this.currencies[currencyCode];
    }

    getCurrencyRepresentation(currencyCode: string) {
        return this.getCurrencyFromCurrencyCode(currencyCode).representation;
    }

    minorUnitsToMajorUnits(minorUnits: number, currency: Currency): number {
        return minorUnits / (1 * 10 ** currency.decimalPlaces);
    }

    minorUnitsToRelativeUnits(minorUnits: number, currency: Currency): number {
        return minorUnits / (this.conversionRates.get(currency) ?? currency.conversionRate);
    }

    majorUnitsToTextRepresentation(majorUnits: number, currency: Currency): string {
        return currency.representation + ' ' + majorUnits.toFixed(currency.decimalPlaces);
    }

    setConversionRate(currencyCode: string, rate: number): void {
        const currency = this.currencies[currencyCode];
        if (currency) {
            this.conversionRates.set(currency, rate);
        }
    }

    setConversionRates(rates: { [currencyCode: string]: number }): void {
        Object.entries(rates).forEach(([code, rate]) => this.setConversionRate(code, rate));
    }

    // Fetches live rates from the exchange rate API and updates all known currencies.
    // API returns raw units per £1 (e.g. JPY: 212). Rates are normalised to account for
    // decimalPlaces so that the conversionRate formula remains consistent.
    async fetchAndUpdateConversionRates(): Promise<void> {
        try {
            const response = await axios.get(EXCHANGE_RATE_API_URL);
            const apiRates: { [currencyCode: string]: number } = response.data.rates;

            const normalizedRates = Object.fromEntries(
                Object.entries(this.currencies)
                    .filter(([code]) => apiRates[code] !== undefined)
                    .map(([code, currency]) => [
                        code,
                        apiRates[code] / (10 ** (2 - currency.decimalPlaces)),
                    ])
            );

            this.setConversionRates(normalizedRates);
            console.log('CurrencyService: conversion rates updated successfully');
        } catch (e) {
            console.log('CurrencyService: failed to fetch conversion rates, retaining existing rates');
            console.log(e);
        }
    }

}

const currencyService = new CurrencyService(currencies);

export default currencyService;
