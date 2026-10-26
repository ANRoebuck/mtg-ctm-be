import dataService, { ClickThroughEntry, SellerCardBreakdown, ClickThroughEvent } from '../services/dataService/DataService';

export { ClickThroughEntry, SellerCardBreakdown, ClickThroughEvent };

export const resetClickThroughs = (): void => {
    dataService.resetClickThroughs();
}

export const recordClickThrough = (card: string, seller: string): Promise<void> => {
    return dataService.recordClickThrough(card, seller);
}

export const getClickThroughsBySeller = (days?: number): Promise<ClickThroughEntry[]> => {
    return dataService.getClickThroughsBySeller(days);
}

export const getClickThroughsByCard = (days?: number): Promise<ClickThroughEntry[]> => {
    return dataService.getClickThroughsByCard(days);
}

export const getClickThroughsCardsBySeller = (days?: number): Promise<SellerCardBreakdown[]> => {
    return dataService.getClickThroughsCardsBySeller(days);
}

export const pruneClickThroughs = (olderThanDays: number): Promise<{ removed: number }> => {
    return dataService.pruneClickThroughs(olderThanDays);
}

export const getRecentClickThroughs = (count: number): Promise<ClickThroughEvent[]> => {
    return dataService.getRecentClickThroughs(count);
}
