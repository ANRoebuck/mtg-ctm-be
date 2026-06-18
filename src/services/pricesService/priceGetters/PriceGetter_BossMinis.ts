import { JSDOM, VirtualConsole } from 'jsdom';
import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { Price } from '../../../types/Price';
import { currencies } from '../../../types/Currency';
import currencyService from '../../currencyService/CurrencyService';
import { isFoil as isFoilFromString } from '../../../utils/utils';

const sellerName = 'Boss Minis';
const baseUrl = 'https://bossminis.co.uk';

// Boss Minis groups all conditions (NM, LP, etc.) and foil states as variants within a single
// product listing. The search results page embeds a hidden <div id="productCardList2-js-{id}">
// per product with a data-product-variants attribute containing per-variant available fields.
// A single request to the search page is sufficient to get all the data we need.

class PriceGetter_BossMinis extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Boss_Minis_logo_300x120.png',
            dataGetter: new DataGetter_BossMinis(),
            dataProcessor: new DataProcessor_BossMinis(),
        });
    }
}

class DataGetter_BossMinis extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?type=product&q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

class DataProcessor_BossMinis extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,
            // Selectors are unused — processData is overridden below
            resultSelector: '', titleSelector: '',
            useSubResults: false, subresultSelector: '', subtitleSelector: '', subtitleFromText: () => '',
            priceSelector: '', priceValueFromPriceText: () => 0,
            stockSelector: '', stockValueFromStockText: () => 0,
            isFoilSelector: '', expansionSelector: '',
            imgSelector: '', imgBaseUrl: '', imgSrcAttribute: '',
            productSelector: '', productBaseUrl: '', productRefAttribute: '',
        });

        const virtualConsole = new VirtualConsole();
        virtualConsole.on('error', () => {});

        this.processData = (rawData: string): Price[] => {
            const prices: Price[] = [];

            let doc: Document;
            try {
                doc = new JSDOM(rawData, { virtualConsole }).window.document;
            } catch {
                return prices;
            }

            const hiddenDivs = [...doc.querySelectorAll('div[id^="productCardList2-js-"]')];

            for (const hiddenDiv of hiddenDivs) {
                if (hiddenDiv.getAttribute('data-product-type') !== 'MTG Single') continue;

                const productId = hiddenDiv.getAttribute('data-product-id');
                const card = doc.querySelector(`.product-card-list2__${productId}`);
                if (!card) continue;

                const fullTitle = card.querySelector('.grid-view-item__title')?.innerHTML?.trim() || '';
                const titleMatch = fullTitle.match(/^(.*?)\s*\[([^\]]+)\]$/);
                const title = titleMatch ? titleMatch[1].trim() : fullTitle;
                const expansion = titleMatch ? titleMatch[2] : '';

                const href = card.querySelector('a[href]')?.getAttribute('href') || '';
                const productRef = baseUrl + href.split('?')[0];

                const imgSrc = 'https:' + (card.querySelector('img.grid-view-item__image')?.getAttribute('src') || '');

                const variantsJson = hiddenDiv.getAttribute('data-product-variants') || '[]';
                let variants: any[];
                try {
                    variants = JSON.parse(variantsJson);
                } catch {
                    continue;
                }

                const availableVariants = variants.filter((v: any) => v.available);

                for (const variant of availableVariants) {
                    const condition: string = variant.public_title;
                    const isFoil = isFoilFromString(condition);
                    const displayTitle = `${title} - ${condition}`;
                    const price_minorUnits: number = variant.price;
                    const price_majorUnits = price_minorUnits / 100;
                    const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, currencies.GBP);
                    const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, currencies.GBP);

                    prices.push({
                        seller: sellerName,
                        title: displayTitle,
                        expansion,
                        isFoil,
                        price_relativeUnits,
                        price_textRepresentation,
                        stock_inStock: true,
                        stock_level: variant.public_title,
                        subtitle: '',
                        productRef,
                        imgSrc,
                    });
                }
            }

            return prices;
        };
    }
}

export default PriceGetter_BossMinis;
