// Historical data reconstruction tool
// ------------------------------------
// Context: `DataService` (src/services/dataService/DataService.ts) holds search-history and
// click-through events purely in memory. Everything is lost on restart. Before we move to a
// persistent store, we need to pull whatever is currently live out of the running app and
// later replay it into the new, persistent version.
//
// The running app cannot be changed without a restart (which would wipe its data), so this
// script only uses the read-only `?days=` query parameter that already exists on:
//   GET /api/data/search-history
//   GET /api/data/click-through/cards-by-seller
// Both endpoints return every term / (seller, card) pair whose count is non-zero within the
// trailing `days` days, aggregated — they do not expose individual event timestamps.
//
// Trick: increasing `days` only ever widens the window, so each term/pair's count is a
// monotonically non-decreasing step function of `days`. Querying `days = 0, 1, 2, ...` and
// diffing consecutive snapshots tells us, for every term/pair, how many events are "N days
// old" for each N — i.e. we recover a *date* for every event, even though the API never
// hands back a timestamp. We keep going until the totals stop increasing, which means we've
// walked back far enough to cover everything the service is holding.
//
// What this script deliberately does NOT do: replay the reconstructed data anywhere. The
// existing POST endpoints (`recordSearchHistory` / `recordClickThrough`) always stamp new
// events with `new Date()` — there's no way to tell them "this happened N days ago". Replaying
// this output will need a temporary import endpoint on the *new* deployment that accepts an
// explicit timestamp per record; that endpoint doesn't exist yet and isn't written here.
//
// Precision: we only recover the *date*, not the time of day — every reconstructed record in
// a given bucket is stamped with exactly the same timestamp (N days before the moment this
// script is run), not the original time it actually happened. That's an accepted trade-off,
// not a bug.
//
// Usage: fix `apiBaseURL` below to point at the live app, then run:
//   node scripts/reconstructHistoricalData.js
// This is read-only against the live API (GET requests only) and safe to run more than once
// while you're still preparing the migration. Run it one last time immediately before the
// live app is redeployed/restarted, since that's the moment its in-memory data disappears.

const fs = require('fs');
const path = require('path');

const apiBaseURL = "https://compare-the-magic.duckdns.org"; // TODO: point this at the live app before running, e.g. "https://mtg-ctm-be.example.com"

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// How many consecutive "no change" days to see before concluding we've reached the start of
// the data. 1 matches "stop as soon as the count stops changing", as discussed, but a single
// genuinely quiet day (no searches/clicks at all) would look identical to "no more data" and
// cut the walk-back short, silently dropping any older history. Raise this if that's a
// concern for the real dataset — it only costs a few extra cheap requests either way.
const REQUIRED_STABLE_DAYS = 1;

// Safety cap so a bug (e.g. totals that never stabilise) can't turn this into an infinite loop
// against a live service.
const MAX_DAYS_TO_CHECK = 3650; // ~10 years

const buildUrl = (urlPath) => `${apiBaseURL.replace(/\/+$/, '')}${urlPath}`;

const fetchJson = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`GET ${url} failed with status ${response.status}`);
    }
    return response.json();
};

const sumCounts = (snapshot) => {
    let total = 0;
    for (const count of snapshot.values()) total += count;
    return total;
};

// Fetches `?days=N` for the search-history endpoint and flattens it into a Map of
// JSON-encoded identity -> count, e.g. '{"term":"Lightning Bolt"}' -> 7.
const fetchSearchHistorySnapshot = async (days) => {
    const { searchHistory } = await fetchJson(buildUrl(`/api/data/search-history?days=${days}`));
    const snapshot = new Map();
    for (const { term, count } of searchHistory) {
        snapshot.set(JSON.stringify({ term }), count);
    }
    return snapshot;
};

// Fetches `?days=N` for the click-through-by-card-and-seller endpoint (the finest-grained
// click-through view available) and flattens it the same way, keyed on (seller, card).
const fetchClickThroughSnapshot = async (days) => {
    const { clickThroughs } = await fetchJson(buildUrl(`/api/data/click-through/cards-by-seller?days=${days}`));
    const snapshot = new Map();
    for (const { seller, cards } of clickThroughs) {
        for (const { name: card, count } of cards) {
            snapshot.set(JSON.stringify({ seller, card }), count);
        }
    }
    return snapshot;
};

// Repeatedly calls `fetchSnapshot(days)` for days = 1, 2, 3, ... until the total count across
// all keys stops increasing, then diffs each consecutive pair of snapshots to work out which
// "N days old" bucket each event belongs to.
//
// Returns one bucket per value of `days` that actually introduced new events, each shaped like
// a ready-to-replay batch: { ageDays, timestamp, items: [{ ...identity, count }] }.
const collectDailyBuckets = async (label, fetchSnapshot, runStartedAt) => {
    const snapshotsByDay = []; // snapshotsByDay[i] holds the response for days = i + 1
    let previousTotal = null;
    let stableStreak = 0;

    // Start at days=1, not 0: cutoff = now at days=0, so that window can never contain an
    // already-recorded event (and the API rejects it outright) — it's an empty baseline, not
    // worth a request.
    for (let days = 1; days <= MAX_DAYS_TO_CHECK; days++) {
        const snapshot = await fetchSnapshot(days);
        snapshotsByDay.push(snapshot);

        const total = sumCounts(snapshot);
        console.log(`[${label}] days=${days} total=${total}`);

        if (total === previousTotal) {
            stableStreak++;
            if (stableStreak >= REQUIRED_STABLE_DAYS) break;
        } else {
            stableStreak = 0;
        }
        previousTotal = total;
    }

    const buckets = [];
    for (let i = 0; i < snapshotsByDay.length; i++) {
        const ageDays = i + 1;
        const current = snapshotsByDay[i];
        const prior = i === 0 ? new Map() : snapshotsByDay[i - 1]; // day 0 is the empty baseline

        const items = [];
        for (const [identityKey, count] of current) {
            const delta = count - (prior.get(identityKey) ?? 0);
            if (delta > 0) {
                items.push({ ...JSON.parse(identityKey), count: delta });
            }
        }

        if (items.length > 0) {
            buckets.push({
                ageDays,
                timestamp: new Date(runStartedAt - ageDays * MS_PER_DAY).toISOString(),
                items,
            });
        }
    }

    return buckets;
};

const reconstructHistoricalData = async () => {
    const runStartedAt = Date.now();

    const searchHistory = await collectDailyBuckets('search-history', fetchSearchHistorySnapshot, runStartedAt);
    const clickThroughs = await collectDailyBuckets('click-through', fetchClickThroughSnapshot, runStartedAt);

    return { reconstructedAt: new Date(runStartedAt).toISOString(), searchHistory, clickThroughs };
};

if (require.main === module) {
    reconstructHistoricalData()
        .then((result) => {
            const outputPath = path.join(__dirname, `reconstructed-data-${Date.now()}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
            console.log(`Wrote reconstructed data to ${outputPath}`);
        })
        .catch((error) => {
            console.error('Failed to reconstruct historical data:', error);
            process.exitCode = 1;
        });
}

module.exports = { reconstructHistoricalData };
