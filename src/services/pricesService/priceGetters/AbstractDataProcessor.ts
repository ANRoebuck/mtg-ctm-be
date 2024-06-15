import { Price } from '../../../types/Price';
import { Currency } from '../../../types/Currency';
import { JSDOM } from 'jsdom';
import currencyService from '../../currencyService/CurrencyService';

export interface AbstractDataProcessor {
    processData: (rawData: any) => Price[];
}

export abstract class AbstractJsonDataProcessor implements AbstractDataProcessor {

    seller: string;
    currency: Currency;

    processData: (rawData: any) => Price[];

    constructor({
        seller,
        currency,
        processData,
    }: JsonProcessorArgs) {
        this.seller = seller;
        this.currency = currency;
        this.processData = processData;
    }

}


export abstract class AbstractHtmlDataProcessor implements AbstractDataProcessor {

    seller: string;
    currency: Currency;

    resultSelector: string;
    titleSelector: string;

    useSubResults: boolean;
    subresultSelector: string;
    subtitleSelector: string;
    subtitleFromText: (x: string) => string;

    priceSelector: string;
    priceValueFromPriceText: (x: string) => number;
    stockSelector: string;
    stockValueFromStockText: (x: string) => number;
    expansionSelector: string;
    isFoilSelector: string;

    imgSelector: string;
    imgBaseUrl: string;
    imgSrcAttribute: string;

    productSelector: string;
    productBaseUrl: string;
    productRefAttribute: string;

    constructor({
        seller, currency: currencyCode, resultSelector, titleSelector,
        useSubResults, subresultSelector, subtitleSelector, subtitleFromText,
        priceSelector, priceValueFromPriceText, stockSelector, stockValueFromStockText,
        expansionSelector, isFoilSelector,
        imgSelector, imgBaseUrl, imgSrcAttribute,
        productSelector, productBaseUrl, productRefAttribute,
    }: HtmlProcoessorArgs) {

        this.seller = seller;
        this.currency = currencyCode;

        this.resultSelector = resultSelector;
        this.titleSelector = titleSelector;

        this.useSubResults = useSubResults;
        this.subresultSelector = subresultSelector;
        this.subtitleSelector = subtitleSelector;
        this.subtitleFromText = subtitleFromText

        this.priceSelector = priceSelector;
        this.priceValueFromPriceText = priceValueFromPriceText;
        this.stockSelector = stockSelector;
        this.stockValueFromStockText = stockValueFromStockText;
        this.expansionSelector = expansionSelector;
        this.isFoilSelector = isFoilSelector;

        this.imgSelector = imgSelector;
        this.imgBaseUrl = imgBaseUrl;
        this.imgSrcAttribute = imgSrcAttribute;

        this.productSelector = productSelector;
        this.productBaseUrl = productBaseUrl;
        this.productRefAttribute = productRefAttribute;
    }


    processData = (rawData: string): Price[] => {
        const processedResults: Price[] = [];

        const resultNodes: Element[] = this.dataToResultsArray(rawData);

        console.log(`Found ${resultNodes.length} potential results`);

        resultNodes.forEach(resultNode => {

            const subresultNodes: Element[] = this.useSubResults ? this.subresultsFromResultNode(resultNode) : [resultNode];

            const title = this.titleFromResultNode(resultNode);
            const imgSrc = this.imgSrcFromResultNode(resultNode);
            const productRef = this.productRefFromResultNode(resultNode);
            const expansion = this.expansionFromResultNode(resultNode);

            subresultNodes.forEach((subresult: Element) => {

                const stock = this.stockFromResultNode(subresult);
                if (!stock.inStock) return;

                const price_minorUnits = this.priceFromResultNode(subresult);
                const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, this.currency);
                const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, this.currency);
                const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, this.currency);

                const subtitle = this.useSubResults ? this.subtitleFromResultNode(subresult) : '';

                const isFoil = this.isFoilFromString(title)
                    || this.isFoilFromString(subtitle)
                    || this.isFoilFromString(expansion)
                    || this.isFoilFromResultNode(subresult);

                processedResults.push({
                    seller: this.seller,
                    title,
                    imgSrc,
                    productRef,
                    expansion,
                    price_relativeUnits,
                    price_textRepresentation,
                    stock_inStock: stock.inStock,
                    stock_level: stock.level,
                    subtitle,
                    isFoil,
                });

            });

        });

        return processedResults;

    }

    dataToResultsArray = (rawData: string): Element[] => {
        const document: Document = new JSDOM(rawData).window.document;
        return [...document.querySelectorAll(this.resultSelector)];
    }


    subresultsFromResultNode = (resultNode: Element): Element[] => [...resultNode.querySelectorAll(this.subresultSelector)];


    getFirstElementHtml = (node: Element, selector: string): string => [...node.querySelectorAll(selector)][0]?.innerHTML || '';
    getFirstelementAttr = (node: Element, selector: string, attr: string): string => [...node.querySelectorAll(selector)][0]?.getAttribute(attr) || '';
    getFirstElementWithAttrHtml = (node: Element, selector: string, attr: string): string => [...node.querySelectorAll(selector)]
        .find((node: Element): boolean => node.hasAttribute(attr))?.innerHTML || '';


    stockFromResultNode = (resultNode: Element): Stock => {
        const html = this.getFirstElementHtml(resultNode, this.stockSelector);
        const value = this.stockValueFromStockText(html) || 0;  // value may be NaN
        return {
            inStock: value > 0,
            level: `${value}`,
        };
    }


    priceFromResultNode = (resultNode: Element): number => {
        const html = this.getFirstElementHtml(resultNode, this.priceSelector);
        return html ? this.priceValueFromPriceText(html) : 0;
    }


    titleFromResultNode = (resultNode: Element): string => {
        const html = this.getFirstElementHtml(resultNode, this.titleSelector);
        return this.stripWhitespace(html);
    }


    subtitleFromResultNode = (resultNode: Element): string => {
        const html = this.getFirstElementHtml(resultNode, this.subtitleSelector);
        return this.stripWhitespace(this.subtitleFromText(html));
    }


    imgSrcFromResultNode = (resultNode: Element): string => {
        const attributeValue = this.getFirstelementAttr(resultNode, this.imgSelector, this.imgSrcAttribute);
        return this.imgBaseUrl + attributeValue;
    }


    productRefFromResultNode = (resultNode: Element): string => {
        const attributeValue = this.getFirstelementAttr(resultNode, this.productSelector, this.productRefAttribute);
        return this.productBaseUrl + this.stripWhitespace(attributeValue);
    }


    expansionFromResultNode = (resultNode: Element): string => {
        const html = this.getFirstElementHtml(resultNode, this.expansionSelector);
        return this.stripWhitespace(html);
    }


    // returns false for an undefined string
    isFoilFromString = (str: string): boolean => Boolean(str) && str.toLowerCase().includes('foil');
    isFoilFromResultNode = (resultNode: Element): boolean => {
        const html = this.getFirstElementHtml(resultNode, this.isFoilSelector);
        return this.isFoilFromString(html.toLowerCase()) || false;
    }


    stripNewLines = (str: string): string => str.replace(/\n/, "");
    stripWhitespace = (str: string): string => str.replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);
}


interface JsonProcessorArgs {
    seller: string;
    currency: Currency;
    processData: (rawData: any) => Price[];
}

interface HtmlProcoessorArgs {
    seller: string,
    currency: Currency,

    resultSelector: string,
    titleSelector: string,

    useSubResults: boolean,
    subresultSelector: string,
    subtitleSelector: string,
    subtitleFromText: (x: string) => string,

    priceSelector: string,
    priceValueFromPriceText: (x: string) => number,
    stockSelector: string,
    stockValueFromStockText: (x: string) => number,
    expansionSelector: string,
    isFoilSelector: string,

    imgSelector: string,
    imgBaseUrl: string,
    imgSrcAttribute: string,

    productSelector: string,
    productBaseUrl: string,
    productRefAttribute: string,
}

export type Stock = {
    inStock: boolean,
    level: string,
}
