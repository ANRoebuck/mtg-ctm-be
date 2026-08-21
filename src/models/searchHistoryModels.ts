import dataService, { SearchHistoryEntry } from '../services/dataService/DataService';

export { SearchHistoryEntry };

export const resetSearchHistory = (): void => {
    dataService.resetSearchHistory();
}

export const recordSearchHistory = (searchedFor: string[]): Promise<void> => {
    return dataService.recordSearchHistory(searchedFor);
}

export const getSearchHistory = (days?: number): Promise<SearchHistoryEntry[]> => {
    return dataService.getSearchHistory(days);
}

export const pruneSearchHistory = (olderThanDays: number): Promise<{ removed: number }> => {
    return dataService.pruneSearchHistory(olderThanDays);
}
