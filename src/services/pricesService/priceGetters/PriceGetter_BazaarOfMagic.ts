import AbstractDataGetter from './AbstractDataGetter';
import { AbstractJsonDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import { JSDOM, VirtualConsole } from 'jsdom';

const sellerName = 'Bazaar of Magic';
const baseUrl = 'https://www.bazaarofmagic.eu';

class PriceGetter_BazaarOfMagic extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'Europe',
            logoUrl: '/images/Bazaar_of_Magic_logo_300x120.png',
            dataGetter: new DataGetter_BazaarOfMagic(),
            dataProcessor: new DataProcessor_BazaarOfMagic(),
        });
    }
}

class DataGetter_BazaarOfMagic extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'en-WW/query?tab=singles&name=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

const virtualConsole = new VirtualConsole();
virtualConsole.on('error', () => {});

class DataProcessor_BazaarOfMagic extends AbstractJsonDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.EUR,

            processData: (rawData: any): Price[] => {
                // rawData is an HTML string — bazaarofmagic.eu uses a custom platform with no JSON API
                let document: Document;
                try {
                    document = new JSDOM(rawData as string, { virtualConsole }).window.document;
                } catch {
                    return [];
                }

                // All product links follow /en-WW/p/[slug]/[id]
                const allProductLinks = [...document.querySelectorAll('a[href*="/en-WW/p/"]')] as HTMLAnchorElement[];

                // Build href → img src map from the image links (links containing an img)
                const imgMap = new Map<string, string>();
                allProductLinks
                    .filter(link => link.querySelector('img'))
                    .forEach(link => {
                        const href = link.getAttribute('href') || '';
                        const img = link.querySelector('img');
                        if (href && img) imgMap.set(href, img.getAttribute('src') || '');
                    });

                // Title links are product links that don't contain an img
                const titleLinks = allProductLinks.filter(link => !link.querySelector('img'));

                return titleLinks.reduce((results: Price[], titleLink: HTMLAnchorElement) => {
                    const href = titleLink.getAttribute('href') || '';
                    const title = titleLink.textContent?.trim() || '';
                    if (!title || !href) return results;

                    const productRef = href.startsWith('http') ? href : `${baseUrl}${href}`;
                    const imgSrc = imgMap.get(href) || '';

                    // Price is plain text in the parent element — e.g. "€ 22,00"
                    // Out-of-stock items show "Keep me informed" with no price — filtered out here
                    const parent = titleLink.parentElement;
                    if (!parent) return results;

                    const priceMatch = (parent.textContent || '').match(/€\s*(\d+[,.]\d{2})/);
                    if (!priceMatch) return results;

                    const price_majorUnits = parseFloat(priceMatch[1].replace(',', '.'));
                    const price_minorUnits = Math.round(price_majorUnits * 100);
                    if (!price_minorUnits) return results;

                    const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.EUR);
                    const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.EUR);
                    const isFoil = /(?<!non[-\s]?)foil/i.test(title);

                    // Title format: "Card Name - Set Name" or "Card Name (foil) - Set Name"
                    const titleParts = title.split(' - ');
                    const expansion = titleParts.length > 1 ? titleParts[titleParts.length - 1] : '';

                    results.push({
                        seller: sellerName,
                        title,
                        imgSrc,
                        productRef,
                        expansion,
                        price_relativeUnits,
                        price_textRepresentation,
                        stock_inStock: true,
                        stock_level: '1',
                        subtitle: '',
                        isFoil,
                    });

                    return results;
                }, []);
            }
        });
    }
}

export default PriceGetter_BazaarOfMagic;
