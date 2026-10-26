import dataService, { SearchHistoryEntry, SearchEvent } from '../services/dataService/DataService';

export { SearchHistoryEntry, SearchEvent };

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

export const getRecentSearches = (count: number): Promise<SearchEvent[]> => {
    return dataService.getRecentSearches(count);
}
