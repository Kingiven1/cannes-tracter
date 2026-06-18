import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://tgdidvzfrysxzcthjmzk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZGlkdnpmcnlzeHpjdGhqbXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTc0NDgsImV4cCI6MjA5NzAzMzQ0OH0.7EpfgQvrkvAVyQVRfSSTkfxL8OodFRDjt-LB-kxN74E";
const ADMIN_EMAIL = "djkingiven@gmail.com";

const api = (path, opts = {}) =>
  fetch(`${SUPABASE_URL}${path}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${opts.token || SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(opts.prefer ? { Prefer: opts.prefer } : {}),
      ...(opts.headers || {}),
    },
  });

const authApi = (path, body) =>
  fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(r => r.json());

const DAYS = ["June 22", "June 23", "June 24", "June 25", "June 26"];
const VIBES = ["Afrobeats / Party", "Networking", "Day Party", "Rooftop", "Culture House", "Brand Event", "Club", "Other"];
const STATUSES = ["going", "maybe", "pass"];

const STATUS_STYLE = {
  going: { bg: "#C8F97A", text: "#000", label: "Going" },
  maybe: { bg: "#FFD166", text: "#000", label: "Maybe" },
  pass:  { bg: "#2a2a2a", text: "#888", label: "Pass" },
};

const EMPTY_FORM = {
  name: "", venue: "", date: "June 22", time: "", vibe: "Other",
  tickets: "", tables: "", address: "", notes: "", status: "maybe",
};

const c = {
  root: { backgroundColor: "#000", color: "#fff", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" },
  header: { padding: "36px 20px 20px", borderBottom: "1px solid #1f1f1f" },
  eyebrow: { fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#C8F97A", margin: "0 0 6px" },
  h1: { fontSize: 38, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase", color: "#fff", margin: 0 },
  sub: { fontSize: 13, color: "#666", marginTop: 8 },
  meta: { display: "flex", gap: 12, fontSize: 12, color: "#666", marginTop: 14, alignItems: "center", justifyContent: "space-between" },
  dayBar: { display: "flex", gap: 8, padding: "14px 20px 10px", overflowX: "auto" },
  dayBtn: (a) => ({ flexShrink: 0, padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: a ? "1px solid #C8F97A" : "1px solid #333", backgroundColor: a ? "#C8F97A" : "transparent", color: a ? "#000" : "#fff", cursor: "pointer" }),
  sectionLabel: { fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8F97A", padding: "12px 20px 6px" },
  list: { padding: "4px 20px 0", display: "flex", flexDirection: "column", gap: 10 },
  card: (featured) => ({ backgroundColor: featured ? "#0d1a00" : "#0f0f0f", border: featured ? "1px solid #C8F97A33" : "1px solid #222", borderRadius: 14, overflow: "hidden" }),
  cardInner: { padding: "14px 14px 12px", cursor: "pointer" },
  cardRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  cardName: { fontWeight: 800, fontSize: 15, color: "#fff", margin: "4px 0 2px" },
  cardVenue: { fontSize: 11, color: "#888" },
  dateText: { fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 },
  statusBtn: (s) => ({ padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800, backgroundColor: STATUS_STYLE[s].bg, color: STATUS_STYLE[s].text, border: "none", cursor: "pointer" }),
  vibeTag: { fontSize: 9, backgroundColor: "#1a1a1a", color: "#aaa", padding: "3px 8px", borderRadius: 999, border: "1px solid #2a2a2a" },
  expandArea: { padding: "10px 14px 14px", borderTop: "1px solid #1a1a1a", display: "flex", flexDirection: "column", gap: 6 },
  detailText: { fontSize: 12, color: "#ccc", margin: 0, lineHeight: 1.5 },
  removeBtn: { fontSize: 11, color: "#444", background: "none", border: "none", cursor: "pointer", alignSelf: "flex-end", padding: 0 },
  addWrap: { padding: "12px 20px 32px" },
  addTrigger: { width: "100%", padding: 14, borderRadius: 12, border: "2px dashed #333", backgroundColor: "transparent", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  flyerBtn: { width: "100%", padding: 14, borderRadius: 12, border: "2px solid #C8F97A", backgroundColor: "transparent", color: "#C8F97A", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10 },
  form: { backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  formLabel: { fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8F97A", margin: 0 },
  inp: { width: "100%", backgroundColor: "#1a1a1a", color: "#fff", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  statusRow: { display: "flex", gap: 8 },
  statusFormBtn: (active, s) => ({ flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 800, backgroundColor: active ? STATUS_STYLE[s].bg : "transparent", color: active ? STATUS_STYLE[s].text : "#666", border: active ? "none" : "1px solid #2a2a2a", cursor: "pointer" }),
  btnRow: { display: "flex", gap: 8 },
  cancelBtn: { flex: 1, padding: 10, borderRadius: 8, fontSize: 12, color: "#888", backgroundColor: "transparent", border: "1px solid #2a2a2a", cursor: "pointer" },
  submitBtn: { flex: 1, padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 800, backgroundColor: "#C8F97A", color: "#000", border: "none", cursor: "pointer" },
  empty: { textAlign: "center", padding: "40px 0", color: "#444", fontSize: 13 },
  scanBox: { backgroundColor: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 14, padding: 16, marginBottom: 10 },
  scanTitle: { fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8F97A", marginBottom: 12 },
  dropZone: { border: "2px dashed #333", borderRadius: 10, padding: "28px 16px", textAlign: "center", cursor: "pointer", backgroundColor: "#0a0a0a" },
  dropText: { color: "#666", fontSize: 13, margin: 0 },
  dropSub: { color: "#444", fontSize: 11, marginTop: 4 },
  previewImg: { width: "100%", borderRadius: 8, marginBottom: 10, maxHeight: 200, objectFit: "cover" },
  scanningBox: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 0" },
  scanText: { color: "#C8F97A", fontSize: 13, fontWeight: 700 },
  scanSub: { color: "#555", fontSize: 11 },
  pill: { display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 10, backgroundColor: "#1a1a1a", color: "#C8F97A", border: "1px solid #2a2a2a", marginBottom: 8 },
  loadingBox: { textAlign: "center", padding: "60px 0", color: "#444", fontSize: 13 },
  authBox: { padding: "40px 20px", display: "flex", flexDirection: "column", gap: 16, maxWidth: 400, margin: "0 auto" },
  authTitle: { fontSize: 22, fontWeight: 900, color: "#fff", margin: 0 },
  authSub: { fontSize: 13, color: "#666", margin: 0 },
  authErr: { fontSize: 12, color: "#ff6b6b", margin: 0 },
  logoutBtn: { fontSize: 11, color: "#555", background: "none", border: "none", cursor: "pointer", padding: 0 },
  featuredStar: { fontSize: 10, color: "#C8F97A", marginLeft: 6 },
  adminToggle: { fontSize: 10, color: "#555", background: "none", border: "1px solid #333", borderRadius: 6, padding: "2px 8px", cursor: "pointer", marginTop: 4 },
};

export default function CannesTracker() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [resetSent, setResetSent] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const handleForgotPassword = async () => {
    if (!authForm.email) { setAuthError("Enter your email first."); return; }
    await authApi("/recover", { email: authForm.email });
    setResetSent(true);
    setAuthError("");
  };

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("All");
  const [mode, setMode] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState(null);
  const [flyerImg, setFlyerImg] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [addingFeatured, setAddingFeatured] = useState(false);
  const [multiDates, setMultiDates] = useState(null);
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const fileRef = useRef();

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    document.body.style.backgroundColor = "#000";
    document.documentElement.style.backgroundColor = "#000";
    checkSession();
  }, []);

  const refreshSession = async (refresh_token) => {
    const data = await authApi("/token?grant_type=refresh_token", { refresh_token });
    if (data.access_token) {
      localStorage.setItem("cannes_session", JSON.stringify(data));
      setSession(data);
      return data;
    }
    return null;
  };

  const checkSession = async () => {
    try {
      const stored = localStorage.getItem("cannes_session");
      if (stored) {
        let s = JSON.parse(stored);
        // Always refresh on load so the token is guaranteed fresh
        const refreshed = await refreshSession(s.refresh_token);
        s = refreshed || s;
        setSession(s);
        await loadEvents(s.access_token, s.user.id, s.refresh_token);
      }
    } catch (e) {}
    setCheckingAuth(false);
  };

  const loadEvents = async (token, userId, refresh_token) => {
    setLoading(true);
    try {
      const [featRes, myRes] = await Promise.all([
        api(`/rest/v1/events?featured=eq.true&order=created_at.asc`, { token }),
        api(`/rest/v1/events?user_id=eq.${userId}&featured=eq.false&order=created_at.asc`, { token }),
      ]);
      let feat = await featRes.json();
      let mine = await myRes.json();

      // If the token expired, refresh and retry once
      const expired = feat?.message === "JWT expired" || mine?.message === "JWT expired" || feat?.code === "PGRST303" || mine?.code === "PGRST303";
      if (expired && refresh_token) {
        const refreshed = await refreshSession(refresh_token);
        if (refreshed) {
          const [featRes2, myRes2] = await Promise.all([
            api(`/rest/v1/events?featured=eq.true&order=created_at.asc`, { token: refreshed.access_token }),
            api(`/rest/v1/events?user_id=eq.${userId}&featured=eq.false&order=created_at.asc`, { token: refreshed.access_token }),
          ]);
          feat = await featRes2.json();
          mine = await myRes2.json();
        }
      }

      if (Array.isArray(feat)) setFeaturedEvents(feat);
      if (Array.isArray(mine)) setMyEvents(mine);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const endpoint = authMode === "login" ? "/token?grant_type=password" : "/signup";
      const data = await authApi(endpoint, { email: authForm.email, password: authForm.password });
      if (data.error || data.error_description) {
        setAuthError(data.error_description || data.error);
      } else if (data.access_token) {
        localStorage.setItem("cannes_session", JSON.stringify(data));
        setSession(data);
        await loadEvents(data.access_token, data.user.id, data.refresh_token);
      } else if (authMode === "signup") {
        setAuthError("Check your email to confirm your account, then log in.");
      }
    } catch (e) {
      setAuthError("Something went wrong. Try again.");
    }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("cannes_session");
    setSession(null);
    setMyEvents([]);
    setFeaturedEvents([]);
  };

  const cycleStatus = async (id, currentStatus, isFeatured) => {
    const next = { going: "maybe", maybe: "pass", pass: "going" };
    const newStatus = next[currentStatus];
    if (isFeatured) {
      setFeaturedEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } else {
      setMyEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    }
    await api(`/rest/v1/events?id=eq.${id}`, {
      token: session.access_token,
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const deleteEvent = async (id, isFeatured) => {
    if (isFeatured) setFeaturedEvents(prev => prev.filter(e => e.id !== id));
    else setMyEvents(prev => prev.filter(e => e.id !== id));
    if (expandedId === id) setExpandedId(null);
    await api(`/rest/v1/events?id=eq.${id}`, {
      token: session.access_token,
      method: "DELETE",
    });
  };

  const toggleFeatured = async (id, currentFeatured) => {
    const newVal = !currentFeatured;
    await api(`/rest/v1/events?id=eq.${id}`, {
      token: session.access_token,
      method: "PATCH",
      body: JSON.stringify({ featured: newVal }),
    });
    await loadEvents(session.access_token, session.user.id);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    const datesToCreate = (multiDates && applyToAllDays) ? multiDates : [form.date];

    const created = [];
    for (const d of datesToCreate) {
      const payload = {
        ...form,
        date: d,
        user_id: session.user.id,
        featured: isAdmin && addingFeatured,
      };
      const res = await api("/rest/v1/events", {
        token: session.access_token,
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (Array.isArray(result) && result[0]) created.push(result[0]);
    }

    if (created.length) {
      const featuredOnes = created.filter(e => e.featured);
      const mineOnes = created.filter(e => !e.featured);
      if (featuredOnes.length) setFeaturedEvents(prev => [...prev, ...featuredOnes]);
      if (mineOnes.length) setMyEvents(prev => [...prev, ...mineOnes]);
    }
    setForm(EMPTY_FORM);
    setAddingFeatured(false);
    setMultiDates(null);
    setApplyToAllDays(true);
    setMode("list");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setFlyerImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const compressImage = (dataUrl) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 1000;
      let w = img.width, h = img.height;
      if (w > maxSize || h > maxSize) {
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = dataUrl;
  });

  const scanFlyer = async () => {
    if (!flyerImg) return;
    setScanning(true);
    setScanError("");
    try {
      const compressed = await compressImage(flyerImg);
      const base64 = compressed.split(",")[1];
      const mediaType = "image/jpeg";
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `You are reading an event flyer. Extract event details and return ONLY valid JSON, no markdown, no explanation:
{
  "name": "event name",
  "venue": "venue name",
  "dates": ["June 22"] or ["June 22", "June 23", "June 24"] if the event spans multiple days - only use dates from this list: June 22, June 23, June 24, June 25, June 26",
  "time": "start-end time or empty string",
  "vibe": "pick one: Afrobeats / Party, Networking, Day Party, Rooftop, Culture House, Brand Event, Club, Other",
  "tickets": "ticket website or empty string",
  "tables": "table reservation contact or empty string",
  "address": "full address or empty string",
  "notes": "performers, hosts, dress code, other key details"
}` }
            ]
          }]
        })
      });
      const data = await response.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const validDates = Array.isArray(parsed.dates) ? parsed.dates.filter(d => DAYS.includes(d)) : [];
      const firstDate = validDates[0] || "June 22";
      setForm(f => ({
        ...f,
        name: parsed.name || "",
        venue: parsed.venue || "",
        date: firstDate,
        time: parsed.time || "",
        vibe: VIBES.includes(parsed.vibe) ? parsed.vibe : "Other",
        tickets: parsed.tickets || "",
        tables: parsed.tables || "",
        address: parsed.address || "",
        notes: parsed.notes || "",
        status: "maybe",
      }));
      setMultiDates(validDates.length > 1 ? validDates : null);
      setApplyToAllDays(true);
      setMode("manual");
      setFlyerImg(null);
    } catch (err) {
      setScanError("Couldn't read flyer. Try a clearer image or fill in manually.");
    } finally {
      setScanning(false);
    }
  };

  const filterEvents = (events) =>
    activeDay === "All" ? events : events.filter(e => e.date === activeDay);

  const EventCard = ({ event, isFeatured }) => {
    const isOpen = expandedId === event.id;
    return (
      <div style={c.card(isFeatured)}>
        <div style={c.cardInner} onClick={() => setExpandedId(isOpen ? null : event.id)}>
          <div style={c.cardRow}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={c.dateText}>{event.date}</span>
                {event.time && <span style={{ fontSize: 10, color: "#555" }}>· {event.time}</span>}
                {isFeatured && <span style={c.featuredStar}>★</span>}
              </div>
              <p style={c.cardName}>{event.name}</p>
              <p style={c.cardVenue}>{event.venue}</p>
            </div>
            <div style={c.cardRight}>
              <button style={c.statusBtn(event.status || "maybe")}
                onClick={e => { e.stopPropagation(); cycleStatus(event.id, event.status || "maybe", isFeatured); }}>
                {STATUS_STYLE[event.status || "maybe"].label}
              </button>
              <span style={c.vibeTag}>{event.vibe}</span>
            </div>
          </div>
        </div>
        {isOpen && (
          <div style={c.expandArea}>
            {event.address && (
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(event.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...c.detailText, color: "#C8F97A", textDecoration: "underline", cursor: "pointer" }}
                onClick={e => e.stopPropagation()}
              >
                📍 {event.address}
              </a>
            )}
            {event.notes && <p style={c.detailText}>💬 {event.notes}</p>}
            {event.tickets && <p style={c.detailText}>🎟 {event.tickets}</p>}
            {event.tables && <p style={c.detailText}>🪑 {event.tables}</p>}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              {isAdmin && (
                <button style={c.adminToggle} onClick={() => toggleFeatured(event.id, event.featured)}>
                  {event.featured ? "★ Unfeature" : "☆ Feature"}
                </button>
              )}
              {(isAdmin || !isFeatured) && (
                <button style={c.removeBtn} onClick={() => deleteEvent(event.id, isFeatured)}>Remove ✕</button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (checkingAuth) {
    return (
      <div style={{ ...c.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#444", fontSize: 13 }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <style>{`* { box-sizing: border-box; } body, html, #root { background-color: #000 !important; } input::placeholder { color: #444; }`}</style>
        <div style={c.root}>
          <div style={c.header}>
            <p style={c.eyebrow}>June 22–26, 2026</p>
            <h1 style={c.h1}>Cannes<br /><span style={{ color: "#C8F97A" }}>Lions</span></h1>
            <p style={c.sub}>Your personal event radar</p>
          </div>
          <div style={c.authBox}>
            <p style={c.authTitle}>{authMode === "login" ? "Welcome back" : "Create account"}</p>
            <p style={c.authSub}>{authMode === "login" ? "Log in to see your schedule" : "Sign up to start tracking events"}</p>
            <input style={c.inp} placeholder="Email" type="email" value={authForm.email}
              onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
            <input style={c.inp} placeholder="Password" type="password" value={authForm.password}
              onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} />
            {authError && <p style={c.authErr}>{authError}</p>}
            <button style={c.submitBtn} onClick={handleAuth} disabled={authLoading}>
              {authLoading ? "..." : authMode === "login" ? "Log In" : "Sign Up"}
            </button>
            <button style={c.cancelBtn} onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}>
              {authMode === "login" ? "No account? Sign up" : "Have an account? Log in"}
            </button>
            {authMode === "login" && (
              <button style={{ fontSize: 11, color: "#555", background: "none", border: "none", cursor: "pointer", marginTop: -4 }} onClick={handleForgotPassword}>
                {resetSent ? "✓ Reset email sent!" : "Forgot password?"}
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  const filteredFeatured = filterEvents(featuredEvents);
  const filteredMine = filterEvents(myEvents);
  const totalGoing = [...featuredEvents, ...myEvents].filter(e => e.status === "going").length;

  return (
    <>
      <style>{`* { box-sizing: border-box; } body, html, #root { background-color: #000 !important; } input::placeholder, textarea::placeholder { color: #444; } select option { background-color: #1a1a1a; color: #fff; } ::-webkit-scrollbar { display: none; }`}</style>
      <div style={c.root}>
        <div style={c.header}>
          <p style={c.eyebrow}>June 22–26, 2026</p>
          <h1 style={c.h1}>Cannes<br /><span style={{ color: "#C8F97A" }}>Lions</span></h1>
          <div style={c.meta}>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#666" }}>
              <span><span style={{ color: "#fff", fontWeight: 700 }}>{featuredEvents.length + myEvents.length}</span> events</span>
              <span style={{ color: "#333" }}>·</span>
              <span><span style={{ color: "#C8F97A", fontWeight: 700 }}>{totalGoing}</span> confirmed</span>
            </div>
            <button style={c.logoutBtn} onClick={handleLogout}>Log out</button>
          </div>
        </div>

        <div style={c.dayBar}>
          {["All", ...DAYS].map(day => (
            <button key={day} style={c.dayBtn(activeDay === day)} onClick={() => setActiveDay(day)}>
              {day === "All" ? "All Days" : day.replace("June ", "Jun ")}
            </button>
          ))}
        </div>

        {filteredFeatured.length > 0 && (
          <>
            <p style={c.sectionLabel}>★ Featured Events</p>
            <div style={c.list}>
              {filteredFeatured.map(event => <EventCard key={event.id} event={event} isFeatured={true} />)}
            </div>
          </>
        )}

        <p style={c.sectionLabel}>My Schedule</p>
        <div style={c.list}>
          {loading && <div style={c.loadingBox}>Loading...</div>}
          {!loading && filteredMine.length === 0 && <div style={c.empty}>No events yet. Add one below!</div>}
          {filteredMine.map(event => <EventCard key={event.id} event={event} isFeatured={false} />)}
        </div>

        <div style={c.addWrap}>
          {mode === "list" && (
            <>
              <button style={c.flyerBtn} onClick={() => setMode("flyer")}>📸 Scan a Flyer</button>
              <button style={c.addTrigger} onClick={() => setMode("manual")}>+ Add Event Manually</button>
            </>
          )}

          {mode === "flyer" && (
            <div style={c.scanBox}>
              <p style={c.scanTitle}>📸 Scan Flyer</p>
              {!flyerImg && !scanning && (
                <>
                  <div style={c.dropZone} onClick={() => fileRef.current.click()}>
                    <p style={c.dropText}>Tap to upload flyer</p>
                    <p style={c.dropSub}>Screenshot, photo, or saved image</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                  <div style={{ ...c.btnRow, marginTop: 10 }}>
                    <button style={c.cancelBtn} onClick={() => setMode("list")}>Cancel</button>
                  </div>
                </>
              )}
              {flyerImg && !scanning && (
                <>
                  <img src={flyerImg} alt="flyer" style={c.previewImg} />
                  {scanError && <p style={{ color: "#ff6b6b", fontSize: 12, margin: "0 0 8px" }}>{scanError}</p>}
                  <div style={c.btnRow}>
                    <button style={c.cancelBtn} onClick={() => { setFlyerImg(null); setScanError(""); }}>Re-upload</button>
                    <button style={c.submitBtn} onClick={scanFlyer}>Read Flyer ✦</button>
                  </div>
                </>
              )}
              {scanning && (
                <div style={c.scanningBox}>
                  <div style={{ fontSize: 28 }}>🔍</div>
                  <p style={c.scanText}>Reading flyer...</p>
                  <p style={c.scanSub}>Extracting event details</p>
                </div>
              )}
            </div>
          )}

          {mode === "manual" && (
            <div style={c.form}>
              <p style={c.formLabel}>Event Details</p>
              {form.name && <span style={c.pill}>✦ AI filled this in</span>}
              {multiDates && (
                <div style={{ backgroundColor: "#0d1a00", border: "1px solid #C8F97A55", borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <input
                    type="checkbox"
                    id="multiday"
                    checked={applyToAllDays}
                    onChange={e => setApplyToAllDays(e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <label htmlFor="multiday" style={{ fontSize: 12, color: "#C8F97A", cursor: "pointer", lineHeight: 1.4 }}>
                    This looks like a multi-day event ({multiDates.map(d => d.replace("June ", "Jun ")).join(", ")}). Add to all {multiDates.length} days? Uncheck to add only {form.date.replace("June ", "Jun ")}.
                  </label>
                </div>
              )}
              {isAdmin && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="featured" checked={addingFeatured}
                    onChange={e => setAddingFeatured(e.target.checked)} />
                  <label htmlFor="featured" style={{ fontSize: 12, color: "#C8F97A", cursor: "pointer" }}>
                    ★ Add as Featured Event (visible to everyone)
                  </label>
                </div>
              )}
              {[
                { key: "name", placeholder: "Event name *" },
                { key: "venue", placeholder: "Venue" },
                { key: "tickets", placeholder: "Tickets / website" },
                { key: "tables", placeholder: "Table reservations contact" },
                { key: "address", placeholder: "Address" },
              ].map(({ key, placeholder }) => (
                <input key={key} style={c.inp} placeholder={placeholder} value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              ))}
              <div style={c.row2}>
                <select style={c.inp} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
                <input style={c.inp} placeholder="Time (e.g. 23:00)" value={form.time}
                  onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
              <select style={c.inp} value={form.vibe} onChange={e => setForm(f => ({ ...f, vibe: e.target.value }))}>
                {VIBES.map(v => <option key={v}>{v}</option>)}
              </select>
              <textarea style={{ ...c.inp, resize: "none" }} rows={2} placeholder="Notes (performers, dress code, etc.)"
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <div style={c.statusRow}>
                {STATUSES.map(s => (
                  <button key={s} style={c.statusFormBtn(form.status === s, s)}
                    onClick={() => setForm(f => ({ ...f, status: s }))}>
                    {STATUS_STYLE[s].label}
                  </button>
                ))}
              </div>
              <div style={c.btnRow}>
                <button style={c.cancelBtn} onClick={() => { setMode("list"); setForm(EMPTY_FORM); setAddingFeatured(false); setMultiDates(null); }}>Cancel</button>
                <button style={c.submitBtn} onClick={handleAdd}>Save Event</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
