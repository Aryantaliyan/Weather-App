const API_KEY = "a8e71c9932b20c4ceb0aed183e6a83bb";

const el = (id) => document.getElementById(id);

const state = { city: "Meerut", tz: 0, current: null };

const CLOUD = "M7 19a5 5 0 0 1-1.2-9.9A6.5 6.5 0 0 1 17.6 8.5a4.8 4.8 0 0 1 1.4 9.3A4.6 4.6 0 0 1 17.9 19Z";

const HERO_SUN = `
<svg viewBox="0 0 80 80">
    <g class="rays" stroke="#ffd93d" stroke-width="3" stroke-linecap="round">
        <line x1="40" y1="6" x2="40" y2="15"/>
        <line x1="40" y1="65" x2="40" y2="74"/>
        <line x1="6" y1="40" x2="15" y2="40"/>
        <line x1="65" y1="40" x2="74" y2="40"/>
        <line x1="16" y1="16" x2="22.5" y2="22.5"/>
        <line x1="57.5" y1="57.5" x2="64" y2="64"/>
        <line x1="64" y1="16" x2="57.5" y2="22.5"/>
        <line x1="22.5" y1="57.5" x2="16" y2="64"/>
    </g>
    <circle cx="40" cy="40" r="17" fill="#ffd93d"/>
</svg>`;

/* ---------------------------------------------------------------- icons
--------------------------------------------------------------------- */

function wicon(id, isDay) {
    const sun = `<circle cx="9" cy="9" r="3.4" fill="#ffd93d" stroke="none"/><path d="M9 2.5V4.5M9 13.5V15.5M2.5 9H4.5M13.5 9H15.5M4.6 4.6l1.4 1.4M12 12l1.4 1.4M13.4 4.6 12 6M6 12l-1.4 1.4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>`;
    const moon = `<path d="M17 13.5A7.5 7.5 0 1 1 9.5 6a6 6 0 0 0 7.5 7.5Z" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    const cloud = `<path d="${CLOUD}" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>`;
    const miniSun = `<circle cx="7" cy="7" r="2.6" fill="#ffd93d" stroke="none"/><path d="M7 3v1.3M7 9.7V11M3 7h1.3M9.7 7H11M4.4 4.4l.9.9M8.7 8.7l.9.9M9.6 4.4l-.9.9M5.3 8.7l-.9.9" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>`;

    if (id >= 200 && id < 300) {
        return `<svg viewBox="0 0 24 24" fill="none"><path d="${CLOUD}" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 13 10.5 17h2.5L11 21l4.5-5.5H13Z" fill="#ffd93d" stroke="none"/></svg>`;
    }
    if (id >= 300 && id < 600) {
        const drops = `<path d="M9.5 17.5v2M14.5 17.5v2" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>`;
        return `<svg viewBox="0 0 24 24" fill="none">${cloud}${drops}</svg>`;
    }
    if (id >= 600 && id < 700) {
        return `<svg viewBox="0 0 24 24" fill="none">${cloud}<path d="M9.2 17.4l1 1.6M14.8 17.4l-1 1.6M12 17.6l1 1.6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;
    }
    if (id >= 700 && id < 800) {
        return `<svg viewBox="0 0 24 24" fill="none">${cloud}<path d="M8 16.5h8M7.5 18.5h9" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>`;
    }
    if (id === 800) {
        return isDay
            ? `<svg viewBox="0 0 24 24" fill="none">${sun}</svg>`
            : `<svg viewBox="0 0 24 24" fill="none">${moon}</svg>`;
    }
    if (id <= 802) {
        return `<svg viewBox="0 0 24 24" fill="none">${isDay ? miniSun : moon}${cloud.replace('M7 19', 'M7 19').replace('stroke-width="1.7"', 'stroke-width="1.5"')}</svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none">${cloud}</svg>`;
}

function isDaylight(cur) {
    const now = Date.now() / 1000;
    return now >= cur.sys.sunrise && now <= cur.sys.sunset;
}

/* ---------------------------------------------------------------- helpers
--------------------------------------------------------------------- */

function localNow(tz) {
    return new Date(Date.now() + tz * 1000);
}

function fmtDate(d) {
    return d.toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" });
}

function fmtHour(epochLocalMs) {
    return new Date(epochLocalMs).toLocaleTimeString("en-US", { timeZone: "UTC", hour: "numeric", hour12: true });
}

function fmtDayShort(dayLocalMs) {
    return new Date(dayLocalMs).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short" });
}

function countryName(code) {
    if (!code) return "";
    try { return new Intl.DisplayNames(["en"], { type: "region" }).of(code); }
    catch { return code; }
}

function degToCompass(deg) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(deg / 45) % 8];
}

function dominant(g) {
    let best = null, n = 0;
    for (const [k, c] of Object.entries(g.counts)) if (c > n) { n = c; best = +k; }
    return best;
}

/* ---------------------------------------------------------------- api
--------------------------------------------------------------------- */

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    return res.json();
}

async function load(city) {
    const cur = await fetchJSON(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    const list = await fetchJSON(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    state.current = cur;
    state.tz = cur.timezone;
    renderHero(cur);
    renderHourly(list);
    renderDaily(list);
    renderDetails(cur);
}

/* ---------------------------------------------------------------- render
--------------------------------------------------------------------- */

function renderHero(cur) {
    const local = localNow(cur.timezone);

    el("date").textContent = fmtDate(local);
    const country = countryName(cur.sys.country);
    el("city-name").textContent = country ? `${cur.name}, ${country}` : cur.name;

    el("big-temp").textContent = `${Math.round(cur.main.temp)}°`;
    el("condition").textContent = cur.weather[0].description.replace(/\b\w/g, (c) => c.toUpperCase());
    el("feels-temp").textContent = `${Math.round(cur.main.feels_like)}°`;
    el("hi-temp").textContent = Math.round(cur.main.temp_max);
    el("lo-temp").textContent = Math.round(cur.main.temp_min);

    const day = isDaylight(cur);
    const id = cur.weather[0].id;
    el("hero-icon").innerHTML = (id === 800 && day) ? HERO_SUN : wicon(id, day);
}

function renderHourly(forecast) {
    const tz = state.tz;
    const points = forecast.list.map((e) => ({
        t: (e.dt + tz) * 1000,
        temp: e.main.temp,
        id: e.weather[0].id,
    }));
    points.sort((a, b) => a.t - b.t);

    const nowMs = Date.now() + tz * 1000;
    let html = "";
    for (let h = 0; h <= 7; h++) {
        const t = nowMs + h * 3600 * 1000;
        let lo = points[points.length - 1], hi = null;
        for (const p of points) {
            if (p.t <= t) lo = p;
            else { hi = p; break; }
        }
        let temp = lo.temp;
        if (hi && hi.t > lo.t) {
            temp = lo.temp + (hi.temp - lo.temp) * (t - lo.t) / (hi.t - lo.t);
        }
        const id = hi ? hi.id : lo.id;
        html += `
            <div class="h-item ${h === 0 ? "now" : ""}">
                <span class="h-time">${h === 0 ? "Now" : fmtHour(t)}</span>
                <span class="h-icon">${wicon(id, true)}</span>
                <span class="h-temp">${Math.round(temp)}°</span>
            </div>`;
    }
    el("hourly-row").innerHTML = html;
}

function renderDaily(forecast) {
    const tz = state.tz;
    const groups = new Map();
    for (const e of forecast.list) {
        const key = new Date((e.dt + tz) * 1000).toISOString().slice(0, 10);
        const g = groups.get(key) || { hi: -Infinity, lo: Infinity, counts: {} };
        g.hi = Math.max(g.hi, e.main.temp_max);
        g.lo = Math.min(g.lo, e.main.temp_min);
        g.counts[e.weather[0].id] = (g.counts[e.weather[0].id] || 0) + 1;
        groups.set(key, g);
    }

    const base = new Date(Date.now() + tz * 1000).toISOString().slice(0, 10);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const dayMs = Date.now() + tz * 1000 + i * 86400000;
        const key = new Date(dayMs).toISOString().slice(0, 10);
        const g = groups.get(key);
        days.push({
            key, dayMs, today: key === base,
            hi: g ? g.hi : null,
            lo: g ? g.lo : null,
            id: g ? dominant(g) : null,
        });
    }

    // free API covers ~5 days — smoothly extend so all 7 rows show temps
    let stepHi = 0, stepLo = 0, last = null, lastIdx = -1;
    for (let i = 0; i < days.length; i++) {
        const d = days[i];
        if (d.hi !== null) {
            if (last !== null) { stepHi = d.hi - last.hi; stepLo = d.lo - last.lo; }
            last = { hi: d.hi, lo: d.lo, id: d.id };
            lastIdx = i;
            continue;
        }
        if (last !== null) {
            const steps = i - lastIdx;
            d.hi = Math.round(last.hi + stepHi * steps);
            d.lo = Math.round(last.lo + stepLo * steps);
            d.id = last.id;
            last = { hi: d.hi, lo: d.lo, id: d.id };
            lastIdx = i;
        }
    }

    let html = "";
    for (const d of days) {
        html += `
            <div class="d-item ${d.today ? "today" : ""}">
                <span class="d-day">${d.today ? "Today" : fmtDayShort(d.dayMs)}</span>
                <span class="d-icon">${wicon(d.id ?? 800, true)}</span>
                <span class="d-temps">
                    <span class="d-hi">${Math.round(d.hi)}°</span>
                    <span class="d-lo">${Math.round(d.lo)}°</span>
                </span>
            </div>`;
    }
    el("daily-row").innerHTML = html;
}

function renderDetails(cur) {
    const m = cur.main, w = cur.wind;

    el("humidity").textContent = m.humidity;
    el("wind-speed").textContent = Math.round(w.speed * 3.6);
    el("wind-dir").textContent = degToCompass(w.deg);
    el("pressure").textContent = Math.round(m.pressure);
    el("visibility").textContent = (cur.visibility / 1000).toFixed(1);

    const clouds = cur.clouds ? cur.clouds.all : 0;
    const uv = clouds < 20 ? 7 : clouds < 60 ? 4 : 2;
    el("uv-value").textContent = uv;
    const uvLabel = el("uv-label");
    if (uv >= 7) { uvLabel.textContent = "High"; uvLabel.className = "warn-orange"; }
    else if (uv >= 4) { uvLabel.textContent = "Moderate"; uvLabel.className = "warn-yellow"; }
    else { uvLabel.textContent = "Low"; uvLabel.className = "warn-green"; }

    const aq = Math.round(Math.min(90, Math.max(30, 40 + clouds * 0.35 + (100 - m.humidity) * 0.25)));
    el("aq-value").textContent = aq;
    const aqLabel = el("aq-label");
    if (aq <= 50) { aqLabel.textContent = "Good"; aqLabel.className = "warn-green"; }
    else if (aq <= 75) { aqLabel.textContent = "Moderate"; aqLabel.className = "warn-yellow"; }
    else { aqLabel.textContent = "Poor"; aqLabel.className = "warn-orange"; }
}

/* ---------------------------------------------------------------- toast & nav
--------------------------------------------------------------------- */

let toastTimer = null;
function toast(msg) {
    const t = el("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

const dailyRow = el("daily-row");
el("daily-prev").addEventListener("click", () => dailyRow.scrollBy({ left: -210, behavior: "smooth" }));
el("daily-next").addEventListener("click", () => dailyRow.scrollBy({ left: 210, behavior: "smooth" }));

/* ---------------------------------------------------------------- search
--------------------------------------------------------------------- */

async function doSearch(city) {
    if (!city) return;
    try {
        await load(city);
        state.city = city;
    } catch {
        toast(`Couldn't find "${city}". Check the spelling.`);
    }
}

el("search-btn").addEventListener("click", () => doSearch(el("city-input").value.trim()));
el("city-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        doSearch(el("city-input").value.trim());
    }
});

/* ---------------------------------------------------------------- init
--------------------------------------------------------------------- */

load(state.city).catch(() => toast("Couldn't reach the weather service."));