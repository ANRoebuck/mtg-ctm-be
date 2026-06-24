export const MTG_CTM_SCRAPE: string = process.env.MTG_CTM_SCRAPE_URL ?? 'http://localhost:5002/api/scrape';

// Returns live exchange rates vs GBP. Free, no auth required.
// Response shape: { rates: { [currencyCode: string]: number } }
export const EXCHANGE_RATE_API_URL: string = 'https://open.er-api.com/v6/latest/GBP';
