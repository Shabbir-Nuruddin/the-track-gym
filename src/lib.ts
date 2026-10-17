export type Lang = "en" | "hi";
export type Bi = { en: string; hi: string };
export type SectionKey = "dishes" | "gallery" | "feature" | "reviews" | "visit" | "build";
/** Opening hours per weekday, Sunday first. Each day is a flat list of [open, close, open, close…] in decimal
 *  hours, so a split morning/evening day has four numbers and a closed day is empty. An empty list overall
 *  means the listing has no dependable timings and none are shown. */
export type Hours = number[][];

export type Theme = {
  dark: boolean;
  bg: string;
  bg2: string;
  panel: string;
  ink: string;
  ink2: string;
  ink3: string;
  line: string;
  accent: string;
  onAccent: string;
  /** CSS font-family name of the display face. */
  display: string;
  weight: number;
  upper: boolean;
};

export type Dish = { name: Bi; quote: string; img?: string };
export type Photo = { src: string; alt: string; wide?: boolean };
export type Review = { quote: string; stars: number };

export type Site = {
  name: string;
  sub: Bi;
  banner: Bi;
  phone: string;
  phoneDisplay: string;
  lat: number;
  lon: number;
  hours: Hours;
  theme: Theme;
  hero: { title: [Bi, Bi]; proof: Bi; fallback: string; backdrop?: string; /** Real photos the hero crossfades through. */ slides?: string[] };
  marquee: string[];
  dishes: { title: Bi; body: Bi; layout: "list" | "cards"; items: Dish[] };
  gallery: { title: Bi; layout: "strip" | "mosaic"; photos: Photo[] };
  feature: Feature;
  reviews: { title: Bi; rating: number; dist: [number, number, number, number, number]; quotes: Review[] };
  visit: { title: Bi; img: string; alt: string; address: Bi; note?: Bi };
  waHello: Bi;
  order: SectionKey[];
  build?: Build;
};

/** Tap-to-build enquiry that ends in a pre-filled WhatsApp message. */
export type Build = {
  title: Bi;
  body: Bi;
  /** Things to tick: goals, classes or facilities named in the reviews. */
  items?: Bi[];
  /** Pick one: who it is for, or the kind of visit. */
  pick?: { label: Bi; options: { name: Bi; note?: Bi }[] };
  people?: boolean;
  when?: boolean;
  /** Message opener, e.g. "Hi PS Fitness, I'd like to join:". */
  hello: Bi;
};

export type Feature =
  | { kind: "occasions"; title: Bi; body: Bi; img: string; items: { label: Bi; quote: string }[] }
  | { kind: "hosts"; title: Bi; body: Bi; img?: string; hosts: { name: string; quote: string }[] }
  | { kind: "thali"; title: Bi; body: Bi; img: string; items: { label: Bi; quote: string }[] }
  | { kind: "daynight"; title: Bi; body: Bi; day: { label: Bi; body: Bi; img: string; quote: string }; night: { label: Bi; body: Bi; img: string; quote: string } }
  | { kind: "counter"; title: Bi; body: Bi; img: string; items: { label: Bi; quote: string }[] }
  | { kind: "stopover"; title: Bi; body: Bi; quote: string; places: { label: Bi; lat: number; lon: number }[] };

export const bi = (b: Bi, lang: Lang) => b[lang];

export function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const fmtHour = (h: number) => {
  const x = h % 24;
  const hh = Math.floor(x);
  const mm = Math.round((x - hh) * 60);
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${hh < 12 ? "AM" : "PM"}`;
};

/** A day's flat hours as [open, close] pairs. */
export const ranges = (day: number[]) => {
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < day.length; i += 2) out.push([day[i], day[i + 1]]);
  return out;
};

/** Live open state in IST across split shifts and closed days. Null when the site shows no timings. */
export function openState(hours: Hours, now: Date): { open: boolean; at: number } | null {
  if (!hours.length) return null;
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  const t = ist.getHours() + ist.getMinutes() / 60;
  for (const [o, c] of ranges(hours[day])) {
    if (t >= o && t < c) return { open: true, at: c };
    if (t < o) return { open: false, at: o };
  }
  for (let i = 1; i <= 7; i++) {
    const next = ranges(hours[(day + i) % 7]);
    if (next.length) return { open: false, at: next[0][0] };
  }
  return null;
}

export const DAYS: Record<Lang, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  hi: ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"],
};

/** Interface strings shared by every fitness site. */
export const UI = {
  en: {
    open: (t: string) => `Open now · till ${t}`,
    allday: "Open now · 24 hours",
    h24: "Open 24 hours",
    closed: (t: string) => `Closed now · opens ${t}`,
    closedDay: "Closed",
    call: "Call to enquire",
    callShort: "Call",
    whatsapp: "WhatsApp",
    directions: "Directions",
    reviews: "Google reviews",
    googleReview: "Google review",
    hours: "Hours",
    today: "Today",
    phone: "Phone",
    scroll: "Scroll",
    kmAway: (n: string) => `${n} km`,
    outOf: "out of 5",
    lang: "Language",
    mapTitle: "Map",
    people: "People",
    day: "Day",
    time: "Time",
    days: ["Today", "Tomorrow", "This weekend"],
    times: ["Morning", "Afternoon", "Evening"],
    send: "Send on WhatsApp",
    empty: "Tap your choices to fill this in",
    items: "Interested in",
  },
  hi: {
    open: (t: string) => `अभी खुला है · ${t} तक`,
    allday: "अभी खुला है · 24 घंटे",
    h24: "24 घंटे खुला",
    closed: (t: string) => `अभी बंद है · ${t} खुलेगा`,
    closedDay: "बंद",
    call: "जानकारी के लिए कॉल करें",
    callShort: "कॉल",
    whatsapp: "व्हाट्सऐप",
    directions: "रास्ता देखें",
    reviews: "गूगल रिव्यू",
    googleReview: "गूगल रिव्यू",
    hours: "समय",
    today: "आज",
    phone: "फ़ोन",
    scroll: "नीचे देखें",
    kmAway: (n: string) => `${n} किमी`,
    outOf: "5 में से",
    lang: "भाषा",
    mapTitle: "नक्शा",
    people: "लोग",
    day: "दिन",
    time: "समय",
    days: ["आज", "कल", "इस वीकेंड"],
    times: ["सुबह", "दोपहर", "शाम"],
    send: "व्हाट्सऐप पर भेजें",
    empty: "अपनी पसंद टैप करें, मैसेज यहां बनेगा",
    items: "रुचि",
  },
};
