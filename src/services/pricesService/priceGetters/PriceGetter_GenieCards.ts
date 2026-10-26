import AbstractDataGetter from './AbstractDataGetter';
import { AbstractHtmlDataProcessor, Stock } from './AbstractDataProcessor';
import AbstractPriceGetter from './AbstractPriceGetter';
import { currencies } from '../../../types/Currency';

const sellerName = 'Genie Cards';
const baseUrl = 'https://www.geniecards.co.uk';

class PriceGetter_GenieCards extends AbstractPriceGetter {
    constructor() {
        super({
            name: sellerName,
            region: 'UK',
            logoUrl: '/images/Genie_Cards_logo_500x500.png', // placeholder: the site's og:image mascot; swap for a proper landscape logo
            dataGetter: new DataGetter_GenieCards(),
            dataProcessor: new DataProcessor_GenieCards(),
        });
    }
}

// Genie Cards is a Wix Stores site. Search results are server-rendered in the raw HTML, so a plain
// axios GET is enough — no scrape service needed (checked Oct 2026: HTTP 200, no bot challenge,
// robots.txt allows crawling). The search is fuzzy and relevance-ordered, returning up to 25
// results per page (a `&page=2` param exists but is not followed here).
class DataGetter_GenieCards extends AbstractDataGetter {
    constructor() {
        super({
            name: sellerName,
            baseUrl: `${baseUrl}/`,
            searchPath: 'search?q=',
            searchSuffix: '',
            searchJoin: '+',
        });
    }
}

// Every printing / finish / condition is its own Wix product with its own price, and its title
// encodes all of that, e.g.
//
//   "Hallowed Fountain - RNA - 251 - Foil - NM - MTG"
//   "Akroma's Will - SOA - 1 - Mystical Archive - NM - MTG"
//   "Fire // Ice - PLST - UMA-225 - NM - MTG"                (promo pack: collector no. is SET-NUMBER)
//   "Hallowed Fountain - RVR - 295 - Borderless - Foil - NM - MTG"
//
// i.e. <name> - <SET> - <collector no.> [- <treatment>]* - <CONDITION> - MTG
export type GenieTitle = {
    name: string,
    set: string,
    collectorNumber: string,
    treatments: string[],  // e.g. ['Borderless', 'Foil'] — includes the finish
    condition: string,     // NM, EX, ...
};

// Set codes are 2-6 uppercase alphanumerics (SLD, PLST, 30A, ...)
const SET_CODE = /^[A-Z0-9]{2,6}$/;
// Collector numbers: 251, 251p, 17p, U19, 249★, or SET-NUMBER for promo packs (M21-246)
const COLLECTOR_NUMBER = /^(?:[A-Z0-9]{2,6}-)?[A-Za-z]?\d+[A-Za-z★]*$/;

export const parseGenieTitle = (rawTitle: string): GenieTitle | null => {
    const parts = rawTitle.split(' - ').map(p => p.trim());

    // Work from the right for the fixed trailer (condition, "MTG") so that a card name which itself
    // contains " - " can't shift anything; then find the set/collector-number pair after the name.
    if (parts.length < 5 || parts[parts.length - 1] !== 'MTG') return null;
    const condition = parts[parts.length - 2];
    const head = parts.slice(0, -2);

    for (let i = 1; i < head.length - 1; i++) {
        if (SET_CODE.test(head[i]) && COLLECTOR_NUMBER.test(head[i + 1])) {
            return {
                name: head.slice(0, i).join(' - '),
                set: head[i],
                collectorNumber: head[i + 1],
                treatments: head.slice(i + 2),
                condition,
            };
        }
    }
    return null;
};

// Only near-mint listings are included: Genie also lists EX (and possibly worse) as separate
// products, and our Price type has no condition field, so mixing them in would make a cheaper EX
// copy look like an NM price. Widen this if we start surfacing condition (e.g. in the subtitle).
const INCLUDED_CONDITIONS = ['NM'];

class DataProcessor_GenieCards extends AbstractHtmlDataProcessor {
    constructor() {
        super({
            seller: sellerName,
            currency: currencies.GBP,

            resultSelector: 'li[data-hook="product-list-grid-item"]',
            titleSelector: '[data-hook="product-item-name"]',

            useSubResults: false,
            subresultSelector: '',
            subtitleSelector: '',
            subtitleFromText: () => '',

            // wix renders the price as "£10.59" (also in a data-wix-price attribute)
            priceSelector: '[data-hook="product-item-price-to-pay"]',
            priceValueFromPriceText: (text): number => parseInt(text.replace(/\D/g, '')),

            stockSelector: '', // not used — see stockFromResultNode
            stockValueFromStockText: (_: string): number => 1, // not used

            expansionSelector: '', // not used — see expansionFromResultNode
            isFoilSelector: '',    // not used — see isFoilFromResultNode

            imgSelector: 'wow-image',
            imgBaseUrl: '',
            imgSrcAttribute: 'data-image-info',

            productSelector: 'a[data-hook="product-item-product-details-link"]',
            productBaseUrl: '',
            productRefAttribute: 'href',
        });
    }

    // Raw title text with HTML entities decoded (innerHTML would leave e.g. "Akroma&#x27;s").
    private rawTitle = (resultNode: Element): string =>
        (resultNode.querySelector(this.titleSelector)?.textContent || '').trim();

    private parsedTitle = (resultNode: Element): GenieTitle | null => parseGenieTitle(this.rawTitle(resultNode));

    // @Override — just the card name; set, collector number, treatments and condition are pulled
    // out into their own fields. Falls back to the raw title if the format is unrecognised.
    titleFromResultNode = (resultNode: Element): string =>
        this.parsedTitle(resultNode)?.name ?? this.rawTitle(resultNode);

    // @Override — set code from the title
    expansionFromResultNode = (resultNode: Element): string =>
        this.parsedTitle(resultNode)?.set ?? '';

    // @Override — non-foil treatments (Borderless, Showcase, Secret Lair, ...) as the subtitle
    subtitleFromResultNode = (resultNode: Element): string =>
        (this.parsedTitle(resultNode)?.treatments ?? []).filter(t => !/foil/i.test(t)).join(', ');

    // @Override — foil / etched foil finishes appear as a treatment segment in the title
    isFoilFromResultNode = (resultNode: Element): boolean =>
        (this.parsedTitle(resultNode)?.treatments ?? []).some(t => this.isFoilFromString(t));

    // @Override — out-of-stock products are still listed, with a disabled add-to-cart button
    // (aria-label="Out of Stock"). A product is only treated as in stock if it has an enabled
    // "Add to Cart" button, so anything unexpected or missing counts as out of stock. Listings that
    // are not an included condition are dropped here too (or whose title we can't parse).
    stockFromResultNode = (resultNode: Element): Stock => {
        const button = resultNode.querySelector('button[data-hook="product-item-add-to-cart-button"]');
        const buttonEnabled = !!button
            && !button.hasAttribute('disabled')
            && button.getAttribute('aria-disabled') !== 'true'
            && button.getAttribute('aria-label') === 'Add to Cart';

        const parsed = this.parsedTitle(resultNode);
        const wanted = !!parsed && INCLUDED_CONDITIONS.includes(parsed.condition);

        return buttonEnabled && wanted ? { inStock: true, level: '1' } : { inStock: false, level: '0' };
    }

    // @Override — the <img> src is a tiny blurred LQIP thumbnail (w_108, blur_2); the real image
    // is the file named in the wow-image's data-image-info JSON.
    imgSrcFromResultNode = (resultNode: Element): string => {
        try {
            const info = JSON.parse(resultNode.querySelector(this.imgSelector)?.getAttribute(this.imgSrcAttribute) || '');
            const uri = info?.imageData?.uri;
            return uri ? `https://static.wixstatic.com/media/${uri}` : '';
        } catch {
            return '';
        }
    }
}

export default PriceGetter_GenieCards;
