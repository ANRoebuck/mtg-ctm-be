// To migrate to Postgres (e.g. Neon or Supabase free tier):
//   1. npm install pg @types/pg
//   2. Set DATABASE_URL env var on Heroku (the add-on or external service provides this)
//   3. Create the table:
//        CREATE TABLE search_events (term TEXT NOT NULL, searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
//   4. Replace the three functions below with SQL equivalents — the signatures stay the same:
//        recordSearchHistory  → INSERT INTO search_events (term) VALUES ($1), ($2), ...
//        getSearchHistory     → SELECT term, COUNT(*) AS count, MAX(searched_at) AS last_searched_at
//                                 FROM search_events
//                                 WHERE ($1::int IS NULL OR searched_at >= NOW() - ($1 || ' days')::interval)
//                                 GROUP BY term ORDER BY count DESC
//        pruneSearchHistory   → DELETE FROM search_events WHERE searched_at < NOW() - ($1 || ' days')::interval

interface SearchEvent {
    term: string;
    searchedAt: Date;
}

export interface SearchHistoryEntry {
    term: string;
    count: number;
    lastSearchedAt: Date;
}

let searchEvents: SearchEvent[] = [];

export const resetSearchHistory = () => { searchEvents = []; };

export const recordSearchHistory = (searchedFor: string[]): Promise<void> => {
    if (!Array.isArray(searchedFor)) {
        return Promise.reject({ status: 400, message: 'searchedFor must be an array of strings' });
    }
    const now = new Date();
    searchedFor.forEach(term => searchEvents.push({ term, searchedAt: now }));
    return Promise.resolve();
};

export const getSearchHistory = (days?: number): Promise<SearchHistoryEntry[]> => {
    const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
    const filtered = cutoff ? searchEvents.filter(e => e.searchedAt >= cutoff) : searchEvents;

    const aggregated = new Map<string, SearchHistoryEntry>();
    for (const { term, searchedAt } of filtered) {
        const existing = aggregated.get(term);
        if (existing) {
            existing.count++;
            if (searchedAt > existing.lastSearchedAt) existing.lastSearchedAt = searchedAt;
        } else {
            aggregated.set(term, { term, count: 1, lastSearchedAt: searchedAt });
        }
    }

    const result = Array.from(aggregated.values()).sort((a, b) => b.count - a.count);
    return Promise.resolve(result);
};

export const pruneSearchHistory = (olderThanDays: number): Promise<{ removed: number }> => {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const before = searchEvents.length;
    searchEvents = searchEvents.filter(e => e.searchedAt >= cutoff);
    return Promise.resolve({ removed: before - searchEvents.length });
};
