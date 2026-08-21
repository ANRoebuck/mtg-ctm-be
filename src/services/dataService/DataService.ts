// To migrate to Postgres (e.g. Neon or Supabase free tier):
//   1. npm install pg @types/pg
//   2. Set DATABASE_URL env var on Heroku (the add-on or external service provides this)
//   3. Create the tables:
//        CREATE TABLE search_events (term TEXT NOT NULL, searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
//        CREATE TABLE click_through_events (
//            card TEXT NOT NULL, seller TEXT NOT NULL, clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
//        );
//   4. Replace the methods below with SQL equivalents — the signatures stay the same:
//        recordSearchHistory        → INSERT INTO search_events (term) VALUES ($1), ($2), ...
//        getSearchHistory           → SELECT term, COUNT(*) AS count, MAX(searched_at) AS last_searched_at
//                                       FROM search_events
//                                       WHERE ($1::int IS NULL OR searched_at >= NOW() - ($1 || ' days')::interval)
//                                       GROUP BY term ORDER BY count DESC
//        pruneSearchHistory         → DELETE FROM search_events WHERE searched_at < NOW() - ($1 || ' days')::interval
//        recordClickThrough         → INSERT INTO click_through_events (card, seller) VALUES ($1, $2)
//        getClickThroughsBySeller/  → SELECT <key> AS name, COUNT(*) AS count
//        getClickThroughsByCard        FROM click_through_events
//                                       WHERE ($1::int IS NULL OR clicked_at >= NOW() - ($1 || ' days')::interval)
//                                       GROUP BY <key> ORDER BY count DESC
//        pruneClickThroughs         → DELETE FROM click_through_events WHERE clicked_at < NOW() - ($1 || ' days')::interval

interface SearchEvent {
    term: string;
    searchedAt: Date;
}

export interface SearchHistoryEntry {
    term: string;
    count: number;
    lastSearchedAt: Date;
}

interface ClickThroughEvent {
    card: string;
    seller: string;
    clickedAt: Date;
}

export interface ClickThroughEntry {
    name: string;
    count: number;
}

export interface SellerCardBreakdown {
    seller: string;
    cards: ClickThroughEntry[];
}

class DataService {

    #searchEvents: SearchEvent[] = [];
    #clickThroughEvents: ClickThroughEvent[] = [];

    resetSearchHistory = (): void => {
        this.#searchEvents = [];
    }

    recordSearchHistory = (searchedFor: string[]): Promise<void> => {
        if (!Array.isArray(searchedFor)) {
            return Promise.reject({ status: 400, message: 'searchedFor must be an array of strings' });
        }
        const now = new Date();
        searchedFor.forEach(term => this.#searchEvents.push({ term, searchedAt: now }));
        return Promise.resolve();
    }

    getSearchHistory = (days?: number): Promise<SearchHistoryEntry[]> => {
        const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filtered = cutoff ? this.#searchEvents.filter(e => e.searchedAt >= cutoff) : this.#searchEvents;

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
    }

    pruneSearchHistory = (olderThanDays: number): Promise<{ removed: number }> => {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
        const before = this.#searchEvents.length;
        this.#searchEvents = this.#searchEvents.filter(e => e.searchedAt >= cutoff);
        return Promise.resolve({ removed: before - this.#searchEvents.length });
    }

    resetClickThroughs = (): void => {
        this.#clickThroughEvents = [];
    }

    recordClickThrough = (card: string, seller: string): Promise<void> => {
        if (!card || !seller) {
            return Promise.reject({ status: 400, message: 'card and seller are required' });
        }
        this.#clickThroughEvents.push({ card, seller, clickedAt: new Date() });
        return Promise.resolve();
    }

    #aggregateClickThroughsBy = (key: keyof Omit<ClickThroughEvent, 'clickedAt'>, days?: number): ClickThroughEntry[] => {
        const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filtered = cutoff ? this.#clickThroughEvents.filter(e => e.clickedAt >= cutoff) : this.#clickThroughEvents;

        const counts = new Map<string, number>();
        for (const event of filtered) {
            const name = event[key];
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }

        return Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    getClickThroughsBySeller = (days?: number): Promise<ClickThroughEntry[]> => {
        return Promise.resolve(this.#aggregateClickThroughsBy('seller', days));
    }

    getClickThroughsByCard = (days?: number): Promise<ClickThroughEntry[]> => {
        return Promise.resolve(this.#aggregateClickThroughsBy('card', days));
    }

    getClickThroughsCardsBySeller = (days?: number): Promise<SellerCardBreakdown[]> => {
        const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
        const filtered = cutoff ? this.#clickThroughEvents.filter(e => e.clickedAt >= cutoff) : this.#clickThroughEvents;

        const bySeller = new Map<string, Map<string, number>>();
        for (const event of filtered) {
            const cardCounts = bySeller.get(event.seller) ?? new Map<string, number>();
            cardCounts.set(event.card, (cardCounts.get(event.card) ?? 0) + 1);
            bySeller.set(event.seller, cardCounts);
        }

        const breakdown = Array.from(bySeller.entries()).map(([seller, cardCounts]) => ({
            seller,
            cards: Array.from(cardCounts.entries())
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count),
        }));

        breakdown.sort((a, b) =>
            b.cards.reduce((sum, c) => sum + c.count, 0) - a.cards.reduce((sum, c) => sum + c.count, 0)
        );

        return Promise.resolve(breakdown);
    }

    pruneClickThroughs = (olderThanDays: number): Promise<{ removed: number }> => {
        const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
        const before = this.#clickThroughEvents.length;
        this.#clickThroughEvents = this.#clickThroughEvents.filter(e => e.clickedAt >= cutoff);
        return Promise.resolve({ removed: before - this.#clickThroughEvents.length });
    }
}

const dataService = new DataService();

export default dataService;
