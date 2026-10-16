// Historical data replay tool
// ----------------------------
// Pairs with scripts/reconstructHistoricalData.js: that script reads the OLD (in-memory,
// pre-persistence) live app's existing `?days=` endpoints and writes a dated reconstruction to
// scripts/reconstructed-data-<timestamp>.json. This script reads that same file and replays it
// into the NEW, persistent version of the app.
//
// The existing public endpoints (`POST /api/data/search-history`, `POST /api/data/click-through`)
// always timestamp new events with `new Date()` — they have no way to accept a historical date,
// so they can't be used here. This script instead posts to two endpoints that DO NOT EXIST YET
// and need to be added to the new deployment before this script can run:
//
//   POST /api/admin/import/search-history
//     body: { entries: [{ term: string, count: number, timestamp: string (ISO 8601) }] }
//   POST /api/admin/import/click-through
//     body: { entries: [{ seller: string, card: string, count: number, timestamp: string (ISO 8601) }] }
//
// Each entry means "record `count` events for this term / seller+card, all dated `timestamp`"
// (we only ever recovered date-level precision from the old app — see
// reconstructHistoricalData.js) — the new endpoint is expected to write `count` rows (or an
// equivalent aggregate) stamped with the given timestamp rather than `now()`.
//
// This writes historical data straight into a persistent store, so treat it like any other
// one-off data-migration tool: gate the new import endpoints behind something more than an
// open route (the adminImportToken placeholder below assumes a bearer token — swap it for
// whatever auth the new app actually uses), and remove both import endpoints again once this
// has been run.
//
// Usage:
//   node scripts/replayHistoricalData.js [path/to/reconstructed-data-*.json] [--dry-run]
// With no path given, it picks the most recently generated reconstructed-data-*.json file in
// this same directory. --dry-run logs what would be sent without making any requests.

const fs = require('fs');
const path = require('path');

const apiBaseURL = "https://compare-the-magic.duckdns.org"; // TODO: point this at the NEW, persistent deployment before running
const adminImportToken = "foo"; // TODO: replace with however the new import endpoints are actually secured

const RECONSTRUCTED_DATA_FILENAME_PATTERN = /^reconstructed-data-\d+\.json$/;

const buildUrl = (urlPath) => `${apiBaseURL.replace(/\/+$/, '')}${urlPath}`;

// With no explicit path, find the most recent file reconstructHistoricalData.js produced in
// this directory. Filenames embed Date.now(), so a plain string sort is also chronological.
const resolveInputPath = (cliPath) => {
    if (cliPath) return path.resolve(cliPath);

    const candidates = fs.readdirSync(__dirname)
        .filter((name) => RECONSTRUCTED_DATA_FILENAME_PATTERN.test(name))
        .sort();

    if (candidates.length === 0) {
        throw new Error(
            `No reconstructed-data-*.json found in ${__dirname}. ` +
            'Run reconstructHistoricalData.js first, or pass a file path explicitly.'
        );
    }

    return path.join(__dirname, candidates[candidates.length - 1]);
};

const loadReconstructedData = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Buckets are just how reconstructHistoricalData.js organised its sweep; for replay we only
// care about the flat list of (identity, count, timestamp) entries they contain.
const flattenBuckets = (buckets) =>
    buckets.flatMap(({ timestamp, items }) => items.map((item) => ({ ...item, timestamp })));

const postImport = async (urlPath, entries, dryRun) => {
    if (entries.length === 0) return;

    if (dryRun) {
        console.log(`[dry-run] POST ${buildUrl(urlPath)} with ${entries.length} entries`);
        console.log(JSON.stringify(entries.slice(0, 3), null, 2), entries.length > 3 ? '...(truncated)' : '');
        return;
    }

    const response = await fetch(buildUrl(urlPath), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminImportToken}`,
        },
        body: JSON.stringify({ entries }),
    });

    if (!response.ok) {
        throw new Error(`POST ${urlPath} failed with status ${response.status}: ${await response.text()}`);
    }

    console.log(`POST ${urlPath} succeeded with ${entries.length} entries`);
};

const replayHistoricalData = async (filePath, { dryRun = false } = {}) => {
    const inputPath = resolveInputPath(filePath);
    console.log(`Reading reconstructed data from ${inputPath}`);

    const { searchHistory, clickThroughs } = loadReconstructedData(inputPath);

    const searchHistoryEntries = flattenBuckets(searchHistory);
    const clickThroughEntries = flattenBuckets(clickThroughs);

    await postImport('/api/admin/import/search-history', searchHistoryEntries, dryRun);
    await postImport('/api/admin/import/click-through', clickThroughEntries, dryRun);

    console.log(
        `Done. ${searchHistoryEntries.length} search-history entries, ` +
        `${clickThroughEntries.length} click-through entries.`
    );
};

if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const cliPath = args.find((arg) => !arg.startsWith('--'));

    replayHistoricalData(cliPath, { dryRun }).catch((error) => {
        console.error('Failed to replay historical data:', error);
        process.exitCode = 1;
    });
}

module.exports = { replayHistoricalData };
