import { Price, StockStatus } from '../../../../types/Price';
import { JSDOM } from 'jsdom';


class AbstractDataProcessor {

    seller: string;

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
                    seller, resultSelector, titleSelector,
                    useSubResults, subresultSelector, subtitleSelector, subtitleFromText,
                    priceSelector, priceValueFromPriceText, stockSelector, stockValueFromStockText,
                    expansionSelector, isFoilSelector,
                    imgSelector, imgBaseUrl, imgSrcAttribute,
                    productSelector, productBaseUrl, productRefAttribute,
                }: Args) {

        this.seller = seller;

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

                const price = this.priceFromResultNode(subresult);
                const stock = this.stockFromResultNode(subresult);
                const subtitle = this.useSubResults ? this.subtitleFromResultNode(subresult) : '';
                const isFoil = this.isFoilFromTitle(title)
                    || this.isFoilFromTitle(subtitle)
                    || this.isFoilFromResultNode(subresult);

                processedResults.push({
                    seller: this.seller,
                    title,
                    imgSrc,
                    productRef,
                    expansion,
                    price,
                    stock,
                    subtitle,
                    isFoil,
                });

            });

        });

        return processedResults;

    }

    dataToResultsArray = (rawData: string): Element[] => {
        // const document = this.parser.parseFromString(rawData, "text/html");
        const { document } = new JSDOM(rawData).window;
        return [...document.querySelectorAll(this.resultSelector)];
    }


    subresultsFromResultNode = (resultNode: Element): Element[] => [...resultNode.querySelectorAll(this.subresultSelector)];


    priceFromResultNode = (resultNode: Element): number | null => [...resultNode.querySelectorAll(this.priceSelector)]
        .map((node: Element): number => this.priceValueFromPriceText(node.innerHTML))[0] || null;


    titleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.titleSelector)]
        .map((node: Element): string => stripWhitespace(node.innerHTML))[0] || '';


    subtitleFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.subtitleSelector)]
        .map((node: Element): string => stripWhitespace(this.subtitleFromText(node.innerHTML)))[0] || '';


    stockFromResultNode = (resultNode: Element): StockStatus => [...resultNode.querySelectorAll(this.stockSelector)]
        .map((node: Element): StockStatus => {
            const value = this.stockValueFromStockText(node.innerHTML);
            return {
                inStock: value > 0,
                stock: value,
            };
        })[0] || { inStock: false, stock: 0 };


    imgSrcFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.imgSelector)]
        .map((node: Element): string => this.imgBaseUrl + node.getAttribute(this.imgSrcAttribute))[0] || '';


    productRefFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.productSelector)]
        .map((node: Element): string => this.productBaseUrl + stripWhitespace(node.getAttribute(this.productRefAttribute) || ''))[0] || '';


    expansionFromResultNode = (resultNode: Element): string => [...resultNode.querySelectorAll(this.expansionSelector)]
        .map((node: Element): string => stripWhitespace(node.innerHTML))[0] || '';


    isFoilFromTitle = (title: string): boolean => title.toLowerCase().includes('foil');
    isFoilFromResultNode = (resultNode: Element): boolean => [...resultNode.querySelectorAll(this.isFoilSelector)]
            .map((node: Element): boolean => this.isFoilFromTitle(node.innerHTML.toLowerCase()))[0] || false;
}

const stripWhitespace = (str: string) : string => str.replace(/([\s]*)(\S[\s\S]*\S)([\s]*)/, `$2`);

interface Args {
    seller: string,

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

export default AbstractDataProcessor;
