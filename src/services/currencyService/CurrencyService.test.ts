import axios, { AxiosStatic } from 'axios';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

// Prevent the constructor's fetchAndUpdateConversionRates from making real HTTP calls
beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: { rates: {} } });
});

// Import after mocking so the singleton constructor uses the mock
import CurrencyService from './CurrencyService';

describe('CurrencyService', () => {

    describe('getCurrencyFromCurrencyCode', () => {
        it('returns the correct currency object', () => {
            const gbp = CurrencyService.getCurrencyFromCurrencyCode('GBP');
            expect(gbp.representation).toBe('£');
            expect(gbp.decimalPlaces).toBe(2);
        });

        it('returns undefined for unknown currency code', () => {
            const result = CurrencyService.getCurrencyFromCurrencyCode('XYZ');
            expect(result).toBeUndefined();
        });
    });

    describe('getCurrencyRepresentation', () => {
        it('returns the representation string for GBP', () => {
            expect(CurrencyService.getCurrencyRepresentation('GBP')).toBe('£');
        });

        it('returns the representation string for EUR', () => {
            expect(CurrencyService.getCurrencyRepresentation('EUR')).toBe('€');
        });
    });

    describe('minorUnitsToMajorUnits', () => {
        it('converts pence to pounds (2dp)', () => {
            const gbp = CurrencyService.getCurrencyFromCurrencyCode('GBP');
            expect(CurrencyService.minorUnitsToMajorUnits(100, gbp)).toBe(1);
            expect(CurrencyService.minorUnitsToMajorUnits(250, gbp)).toBe(2.5);
        });

        it('converts JPY (0dp) — minor units equal major units', () => {
            const jpy = CurrencyService.getCurrencyFromCurrencyCode('JPY');
            expect(CurrencyService.minorUnitsToMajorUnits(500, jpy)).toBe(500);
        });
    });

    describe('majorUnitsToTextRepresentation', () => {
        it('formats GBP to 2 decimal places with representation prefix', () => {
            const gbp = CurrencyService.getCurrencyFromCurrencyCode('GBP');
            expect(CurrencyService.majorUnitsToTextRepresentation(10, gbp)).toBe('£ 10.00');
        });

        it('formats EUR to 2 decimal places', () => {
            const eur = CurrencyService.getCurrencyFromCurrencyCode('EUR');
            expect(CurrencyService.majorUnitsToTextRepresentation(9.9, eur)).toBe('€ 9.90');
        });

        it('formats JPY to 0 decimal places', () => {
            const jpy = CurrencyService.getCurrencyFromCurrencyCode('JPY');
            expect(CurrencyService.majorUnitsToTextRepresentation(500, jpy)).toBe('¥ 500');
        });
    });

    describe('setConversionRate and minorUnitsToRelativeUnits', () => {
        afterEach(() => {
            // Restore GBP rate to default after each test
            CurrencyService.setConversionRate('GBP', 1);
        });

        it('minorUnitsToRelativeUnits uses the default rate initially', () => {
            const gbp = CurrencyService.getCurrencyFromCurrencyCode('GBP');
            // 100 GBP pence / 1 = 100 relative units
            expect(CurrencyService.minorUnitsToRelativeUnits(100, gbp)).toBe(100);
        });

        it('setConversionRate updates the rate used by minorUnitsToRelativeUnits', () => {
            const gbp = CurrencyService.getCurrencyFromCurrencyCode('GBP');
            CurrencyService.setConversionRate('GBP', 2);
            expect(CurrencyService.minorUnitsToRelativeUnits(100, gbp)).toBe(50);
        });

        it('silently ignores unknown currency codes', () => {
            expect(() => CurrencyService.setConversionRate('XYZ', 99)).not.toThrow();
        });
    });

    describe('setConversionRates', () => {
        afterEach(() => {
            CurrencyService.setConversionRate('GBP', 1);
            CurrencyService.setConversionRate('EUR', 1.16);
        });

        it('updates multiple rates at once', () => {
            const gbp = CurrencyService.getCurrencyFromCurrencyCode('GBP');
            const eur = CurrencyService.getCurrencyFromCurrencyCode('EUR');

            CurrencyService.setConversionRates({ GBP: 2, EUR: 2.5 });

            expect(CurrencyService.minorUnitsToRelativeUnits(100, gbp)).toBe(50);
            expect(CurrencyService.minorUnitsToRelativeUnits(100, eur)).toBe(40);
        });
    });

    describe('fetchAndUpdateConversionRates', () => {
        afterEach(() => {
            // Restore defaults
            CurrencyService.setConversionRate('GBP', 1);
            CurrencyService.setConversionRate('EUR', 1.16);
            CurrencyService.setConversionRate('USD', 1.35);
            CurrencyService.setConversionRate('JPY', 2.12);
        });

        it('fetches rates and normalises 2dp currencies', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    rates: {
                        GBP: 1,
                        EUR: 1.20,
                        USD: 1.40,
                    }
                }
            });

            await CurrencyService.fetchAndUpdateConversionRates();

            const eur = CurrencyService.getCurrencyFromCurrencyCode('EUR');
            const usd = CurrencyService.getCurrencyFromCurrencyCode('USD');
            // For 2dp currencies: conversionRate = apiRate / 10^(2-2) = apiRate
            expect(CurrencyService.minorUnitsToRelativeUnits(100, eur)).toBeCloseTo(100 / 1.20);
            expect(CurrencyService.minorUnitsToRelativeUnits(100, usd)).toBeCloseTo(100 / 1.40);
        });

        it('normalises 0dp currencies (JPY) by dividing by 100', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    rates: {
                        JPY: 200,
                    }
                }
            });

            await CurrencyService.fetchAndUpdateConversionRates();

            const jpy = CurrencyService.getCurrencyFromCurrencyCode('JPY');
            // For 0dp: conversionRate = apiRate / 10^(2-0) = 200 / 100 = 2
            // 500 JPY / 2 = 250 relative units
            expect(CurrencyService.minorUnitsToRelativeUnits(500, jpy)).toBe(250);
        });

        it('retains existing rates when the API call fails', async () => {
            // Set a known rate first
            CurrencyService.setConversionRate('EUR', 1.5);
            const eur = CurrencyService.getCurrencyFromCurrencyCode('EUR');

            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

            await CurrencyService.fetchAndUpdateConversionRates();

            // Rate should be unchanged
            expect(CurrencyService.minorUnitsToRelativeUnits(150, eur)).toBe(100);
        });

        it('does not throw when the API call fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
            await expect(CurrencyService.fetchAndUpdateConversionRates()).resolves.not.toThrow();
        });

        it('ignores currencies returned by the API that are not in the currencies map', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    rates: {
                        XYZ: 99,
                        GBP: 1,
                    }
                }
            });

            await expect(CurrencyService.fetchAndUpdateConversionRates()).resolves.not.toThrow();
        });
    });

});
