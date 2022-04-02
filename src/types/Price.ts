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
    price: number | null,
    stock: StockStatus,
    subtitle: string,
    isFoil: boolean,
}
