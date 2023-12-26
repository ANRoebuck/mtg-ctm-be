import { Price } from '../../../../types/Price';
import { JSDOM } from 'jsdom';
import currencyService from '../../../currencyService/CurrencyService';
import { writeFileSync } from 'fs';

export interface AbstractDataProcessor {
    processData: (rawData: any) => Price[]
}

export class AbstractJsonDataProcessor implements AbstractDataProcessor {
    processData = (rawData: object): Price[] => {
        return [];
    }
}


export class AbstractHtmlDataProcessor implements AbstractDataProcessor {

    seller: string;
    currencyCode: string;

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
                    seller, currencyCode, resultSelector, titleSelector,
                    useSubResults, subresultSelector, subtitleSelector, subtitleFromText,
                    priceSelector, priceValueFromPriceText, stockSelector, stockValueFromStockText,
                    expansionSelector, isFoilSelector,
                    imgSelector, imgBaseUrl, imgSrcAttribute,
                    productSelector, productBaseUrl, productRefAttribute,
                }: HtmlProcoessorArgs) {

        this.seller = seller;
        this.currencyCode = currencyCode;

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


    processData = (rawData: string) : Price[] => {
        const processedResults: Price[] = [];

        const resultNodes: Element[] = this.dataToResultsArray(rawData);

        resultNodes.forEach(resultNode => {

            const subresultNodes: Element[] = this.useSubResults
                ? this.subresultsFromResultNode(resultNode) : [resultNode];

            const title = this.titleFromResultNode(resultNode);
            const imgSrc = this.imgSrcFromResultNode(resultNode);
            const productRef = this.productRefFromResultNode(resultNode);
            const expansion = this.expansionFromResultNode(resultNode);

            subresultNodes.forEach((subresult : Element) => {

                const stock = this.stockFromResultNode(subresult);
                if(!stock.inStock) return;

                const price_minorUnits = this.priceFromResultNode(subresult);
                const price_majorUnits = currencyService.minorUnitsToMajorUnits(price_minorUnits, this.currencyCode);
                const price_relativeUnits = currencyService.minorUnitsToRelativeUnits(price_minorUnits, this.currencyCode);
                const price_textRepresentation = currencyService.majorUnitsToTextRepresentation(price_majorUnits, this.currencyCode);
                
                const subtitle = this.useSubResults ? this.subtitleFromResultNode(subresult) : '';
                
                const isFoil =
                       this.isFoilFromTitle(title)
                    || this.isFoilFromTitle(subtitle)
                    || this.isFoilFromTitle(expansion)
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

        // console.log(processedResults);

        return processedResults;

    }

    dataToResultsArray = (rawData: string): Element[] => {
        const document: Document = new JSDOM(rawData).window.document;
        return [...document.querySelectorAll(this.resultSelector)];
    }


    subresultsFromResultNode = (resultNode: Element): Element[] => [...resultNode.querySelectorAll(this.subresultSelector)];


    stockFromResultNode = (resultNode: Element): Stock => [...resultNode.querySelectorAll(this.stockSelector)]
        .map((node: Element): Stock => {
            const value = this.stockValueFromStockText(node.innerHTML);
            return {
                inStock: value > 0,
                level: '' + value,
            };
        })[0] || { inStock: false, level: 0 };


    priceFromResultNode = (resultNode: Element): number => [...resultNode.querySelectorAll(this.priceSelector)]
        .map((node: Element): number => this.priceValueFromPriceText(node.innerHTML))[0] || 0;


    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map((node: Element): string => this.stripWhitespace(node.innerHTML))[0] || '';


    subtitleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.subtitleSelector)]
        .map((node: Element): string => this.stripWhitespace(this.subtitleFromText(node.innerHTML)))[0] || '';


    imgSrcFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.imgSelector)]
        .map((node: Element): string => this.imgBaseUrl + node.getAttribute(this.imgSrcAttribute))[0] || '';


    productRefFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.productSelector)]
        .map((node: Element): string => this.productBaseUrl + this.stripWhitespace(node.getAttribute(this.productRefAttribute) || ''))[0] || '';


    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map((node: Element): string => this.stripWhitespace(node.innerHTML))[0] || '';


    isFoilFromTitle = (title: string): boolean => title.toLowerCase().includes('foil');
    isFoilFromResultNode = (resultNode: Element): boolean => [...resultNode.querySelectorAll(this.isFoilSelector)]
            .map((node: Element): boolean => this.isFoilFromTitle(node.innerHTML.toLowerCase()))[0] || false;


    stripNewLines = (str: string) : string => str.replace(/\n/, "");
    stripWhitespace = (str: string) : string => str.replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);
}

const saveToFile = (filePath: string, contents: string) => {
    try {
        writeFileSync(filePath, contents);  
    } catch (e) {
        console.log(e);
    }
}

interface HtmlProcoessorArgs {
    seller: string,
    currencyCode: string,

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
