Cross-Project Compatibility Analysis
mtg-ctm-mob — Unaffected
The mob app still uses a local static configureSellers() from utils/utils.tsx and doesn't call the new endpoint at all. No changes needed and no risk.

mtg-ctm-web — No Breaking Changes, but several things to note
The core contract works correctly. The web's new getSellers() in gateway/http.js calls GET /api/prices, and the backend returns { sellers: [{name, region, logoUrl}] }. The frontend maps that to { ...s, logo: ctmBase + s.logoUrl }, and SellerOption only uses {logo, name, enabled, favourite} — all present.

Things to be aware of:

currency was dropped from seller objects — The old static sellers.js had a currency field per seller. The backend Seller type doesn't include it. This is safe because neither frontend reads currency from seller objects. The currency display in Results comes from price objects, not sellers.

Many new sellers will appear for existing users — The backend now has 28 active sellers vs the 18 in the old static list. When updateSellerInfo runs on first load, ~10 new sellers (401 Games, 7th City Collectables, Boss Minis, Cosmic Collectables, Face to Face Games, Gearhead Games, Hareruya, Mox In The Hole, Mighty Lancer, Mr Card Singles, Unicorn Cards, Waypoint Games) will be added as enabled. Four previously listed sellers (Dice Saloon, Mana Gaming, Lazy Dragon Gaming, Mountbatten Collectables) will be removed. Not a break, but a notable UX change on first load after deploy.

updateSellerInfo has no error handling — It's now async and awaits getSellers(). If the HTTP call fails (race condition on startup, cold start, etc.), there's no .catch(), so the error is silently swallowed. Previously the call was synchronous and could never fail. Low risk in practice, but worth noting.

Image filenames contain spaces — logoUrl values like /images/Axion Now.png produce URLs with literal spaces. Browsers auto-encode these in img src attributes, so this works, but it's mildly fragile if these URLs are ever used in a fetch() call or CSS.

New backend routes — No impact on existing integrations
The /api/search-history and /api/click-through routes are new additions and are called with catch(() => {}) in the frontend, so failures are silently ignored. The /images static file serving is additive.

Recommendation: The deploy should be safe, but I'd suggest deploying the backend first (since the frontend hits GET /api/prices on load), and warn that existing users will see a burst of new sellers enabled on their first session.