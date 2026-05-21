// To migrate to Postgres (e.g. Neon or Supabase free tier):
//   1. npm install pg @types/pg
//   2. Set DATABASE_URL env var on Heroku (the add-on or external service provides this)
//   3. Create the table:
//        CREATE TABLE click_through_events (
//            card TEXT NOT NULL, seller TEXT NOT NULL, clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
//        );
//   4. Replace the functions below with SQL equivalents — the signatures stay the same:
//        recordClickThrough   → INSERT INTO click_through_events (card, seller) VALUES ($1, $2)
//        getClickThroughs     → SELECT <key> AS name, COUNT(*) AS count
//                                 FROM click_through_events
//                                 WHERE ($1::int IS NULL OR clicked_at >= NOW() - ($1 || ' days')::interval)
//                                 GROUP BY <key> ORDER BY count DESC
//        pruneClickThroughs   → DELETE FROM click_through_events WHERE clicked_at < NOW() - ($1 || ' days')::interval

interface ClickThroughEvent {
    card: string;
    seller: string;
    clickedAt: Date;
}

export interface ClickThroughEntry {
    name: string;
    count: number;
}

let clickThroughEvents: ClickThroughEvent[] = [];

export const resetClickThroughs = () => { clickThroughEvents = []; };

export const recordClickThrough = (card: string, seller: string): Promise<void> => {
    if (!card || !seller) {
        return Promise.reject({ status: 400, message: 'card and seller are required' });
    }
    clickThroughEvents.push({ card, seller, clickedAt: new Date() });
    return Promise.resolve();
};

const aggregateBy = (key: keyof Omit<ClickThroughEvent, 'clickedAt'>, days?: number): ClickThroughEntry[] => {
    const cutoff = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
    const filtered = cutoff ? clickThroughEvents.filter(e => e.clickedAt >= cutoff) : clickThroughEvents;

    const counts = new Map<string, number>();
    for (const event of filtered) {
        const name = event[key];
        counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
};

export const getClickThroughsBySeller = (days?: number): Promise<ClickThroughEntry[]> => {
    return Promise.resolve(aggregateBy('seller', days));
};

export const getClickThroughsByCard = (days?: number): Promise<ClickThroughEntry[]> => {
    return Promise.resolve(aggregateBy('card', days));
};

export const pruneClickThroughs = (olderThanDays: number): Promise<{ removed: number }> => {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const before = clickThroughEvents.length;
    clickThroughEvents = clickThroughEvents.filter(e => e.clickedAt >= cutoff);
    return Promise.resolve({ removed: before - clickThroughEvents.length });
};
