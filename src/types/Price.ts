export interface StockStatus {
    inStock: boolean,
    stock: number,
}

export type Price = {
    title: string,
    imgSrc: string,
    productRef: string,
    expansion: string,
    price: number,
    stock: StockStatus,
    subtitle: string,
    isFoil: boolean,
}
