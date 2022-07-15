export interface StockStatus {
    inStock: boolean,
    stock: number,
}

export type Price = {
    seller: string,
    title: string,
    imgSrc: string,
    productRef: string,
    expansion: string,
    price_relativeUnits: number,
    price_textRepresentation: string,
    stock: StockStatus,
    subtitle: string,
    isFoil: boolean,
}
