# Off-Site SEO — Jake's To-Do List

The website changes are live, but most local search visibility is decided
*off* the website. These are the tasks only you can do. Times are rough.

> **What's new in this deploy:** the full on-page SEO is now live (canonical
> tags, LocalBusiness/AutoWash structured data, keyword-first titles, real
> sitemap + robots), and every page now also targets **"car wash"** — the
> biggest missed search (~3,800 impressions/month we were sitting at position
> ~7 on). The homepage, all 10 area pages and the exterior service page
> (`/services/exterior-wash/`) now say "car wash" in their titles and copy.

## 0. Turn on HTTPS (2 min, do this first)

GitHub → your `JakesCarCare` repo → **Settings → Pages** → tick
**"Enforce HTTPS."** Right now the `http://` version of the site answers
without redirecting to `https://`, which splits ranking signals. This one
toggle fixes it.

## 1. Google Search Console (~10 min, do next)

1. Go to <https://search.google.com/search-console> and sign in with the
   Google account that owns the business.
2. Add property → **Domain** → `jakescarcare.ie`. It asks for a DNS TXT
   record: add it wherever your domain is registered (the registrar where
   jakescarcare.ie was bought), then click Verify.
   - If DNS feels awkward: choose **URL prefix** → `https://jakescarcare.ie`
     → verify by **HTML file** — send me the file and I'll add it to the site.
3. Once verified: **Sitemaps** → submit `sitemap.xml` (re-submit even if it's
   already there — it changed).
4. **URL inspection** → paste each of these → Request indexing. Do the car-wash
   page first, it's the big new target:
   - `https://jakescarcare.ie/services/exterior-wash/` ← the "car wash" page
   - `https://jakescarcare.ie/`
   - `https://jakescarcare.ie/areas/roscommon-town/`
   - `https://jakescarcare.ie/areas/longford-town/`
   - `https://jakescarcare.ie/services/full-valet/`
   - `https://jakescarcare.ie/faq/`

## 2. Bing Webmaster Tools (~3 min — feeds ChatGPT search)

Go to <https://www.bing.com/webmasters>, sign in, and choose **Import from
Google Search Console** — one click, brings the site and sitemap across.

## 3. Google Business Profile (biggest lever — ongoing)

Your profile is claimed and active. Make it match the website exactly:

- **Categories** (do this first): keep your primary category, then **add
  "Car wash" as a secondary category**. This is what puts you in the map pack
  for "car wash near me" — worth ~600 map searches/month we're currently
  missing. Also worth adding: "Car detailing service".
- **Service area**: set to the towns we serve — Strokestown, Roscommon Town,
  Longford Town, Castlerea, Boyle, Carrick-on-Shannon, Ballymahon,
  Edgeworthstown. (Don't set a straight-line radius.)
- **Services**: add every service *with prices* — Full Valet €100–€120,
  Interior Only €70–€90, Exterior Only €50, Protector Wax +€25, Iron
  Fallout +€20.
- **Hours**: Saturday & Sunday 9:00–18:00 only.
- **Photos**: upload 2–3 before/after shots **every week** (you already take
  them). Fresh photos are a ranking signal.
- **Q&A**: seed 6–8 questions yourself using the site FAQ (cost, areas,
  call-out fee, water/electricity, rain, payment) — you can post both the
  question and the answer.
- **Reviews**: ask every happy customer the same day, while the shine is
  fresh — target 2–4 per month. Reply to every review within 48 hours
  (a sentence is enough; mention the town: "Thanks Mary — enjoy the clean
  car around Boyle!").
- **Posts**: one per month minimum (before/after, seasonal offer, new area).

## 4. Irish directories (one afternoon, once)

Create/claim listings with EXACTLY this NAP everywhere:

> **Jake's Car Care** · Strokestown, Co. Roscommon · 087 766 5058 · https://jakescarcare.ie

- Golden Pages (goldenpages.ie)
- Yelp Ireland
- FindaBusiness.ie / Cylex Ireland / Hotfrog Ireland
- Facebook page: check the About section matches the NAP above and links the site
- TikTok bio: link https://jakescarcare.ie

Never publish your home address anywhere — town-level only, same as the site.

## 5. Monthly habit (15 min)

- 2–3 new GBP photos + reply to reviews
- Glance at Search Console → Performance: which towns/queries are growing
- If you change prices or fee rules, tell me — the site's structured data,
  FAQ and town pages need to be regenerated to match.
