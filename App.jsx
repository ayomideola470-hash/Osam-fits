import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// STORAGE HELPERS (persistent across sessions)
// ─────────────────────────────────────────────
const store = {
  async get(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },
  async set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
};

// ─────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────
const SEED_BOOKINGS = [
  { id: "bk001", clientName: "Temi Adeyemi", email: "temi@example.com", country: "United Kingdom", service: "Bespoke Commission", date: "2026-05-20", amount: 850000, currency: "NGN", status: "pending", message: "Need a gown for my sister's wedding in June.", createdAt: "2026-04-10T09:22:00Z", avatar: "TA" },
  { id: "bk002", clientName: "Marcus Webb", email: "marcus@example.com", country: "United States", service: "Brand Styling Mandate", date: "2026-05-27", amount: 400000, currency: "NGN", status: "confirmed", message: "Campaign shoot for my new brand launch.", createdAt: "2026-04-09T14:05:00Z", avatar: "MW" },
  { id: "bk003", clientName: "Chisom Obi", email: "chisom@example.com", country: "Canada", service: "Bespoke Commission", date: "2026-06-03", amount: 1200000, currency: "NGN", status: "confirmed", message: "Red carpet piece for the Toronto Film Festival.", createdAt: "2026-04-08T11:30:00Z", avatar: "CO" },
  { id: "bk004", clientName: "Amara Eze", email: "amara@example.com", country: "Nigeria", service: "Speaking & Panels", date: "2026-05-19", amount: 200000, currency: "NGN", status: "pending", message: "Panel session on African fashion identity.", createdAt: "2026-04-07T08:44:00Z", avatar: "AE" },
  { id: "bk005", clientName: "Lena Hartmann", email: "lena@example.com", country: "Germany", service: "Bespoke Commission", date: "2026-06-10", amount: 950000, currency: "NGN", status: "cancelled", message: "Cancelled — schedule conflict.", createdAt: "2026-04-06T16:20:00Z", avatar: "LH" },
  { id: "bk006", clientName: "Yusuf Al-Rashid", email: "yusuf@example.com", country: "UAE", service: "Brand Styling Mandate", date: "2026-06-17", amount: 600000, currency: "NGN", status: "pending", message: "Full wardrobe for a fashion editorial in Dubai.", createdAt: "2026-04-05T10:15:00Z", avatar: "YA" },
];

const SEED_CLIENTS = [
  { id: "cl001", name: "Temi Adeyemi", email: "temi@example.com", country: "United Kingdom", totalBookings: 2, totalSpend: 1700000, lastBooking: "2026-04-10", avatar: "TA" },
  { id: "cl002", name: "Marcus Webb", email: "marcus@example.com", country: "United States", totalBookings: 1, totalSpend: 400000, lastBooking: "2026-04-09", avatar: "MW" },
  { id: "cl003", name: "Chisom Obi", email: "chisom@example.com", country: "Canada", totalBookings: 3, totalSpend: 2800000, lastBooking: "2026-04-08", avatar: "CO" },
  { id: "cl004", name: "Amara Eze", email: "amara@example.com", country: "Nigeria", totalBookings: 1, totalSpend: 200000, lastBooking: "2026-04-07", avatar: "AE" },
  { id: "cl005", name: "Lena Hartmann", email: "lena@example.com", country: "Germany", totalBookings: 2, totalSpend: 950000, lastBooking: "2026-04-06", avatar: "LH" },
  { id: "cl006", name: "Yusuf Al-Rashid", email: "yusuf@example.com", country: "UAE", totalBookings: 1, totalSpend: 600000, lastBooking: "2026-04-05", avatar: "YA" },
];

const SEED_TEAM = [
  { id: "tm001", name: "Osam (You)", role: "Owner", email: "osam@osamfits.com", access: "full", avatar: "OS", status: "active" },
  { id: "tm002", name: "Adaora Nwosu", role: "Booking Manager", email: "adaora@osamfits.com", access: "bookings", avatar: "AN", status: "active" },
  { id: "tm003", name: "Emeka Ibe", role: "Client Relations", email: "emeka@osamfits.com", access: "clients", avatar: "EI", status: "active" },
];

const MONTHLY_REVENUE = [
  { month: "Nov", revenue: 1200000 }, { month: "Dec", revenue: 2100000 },
  { month: "Jan", revenue: 1800000 }, { month: "Feb", revenue: 2400000 },
  { month: "Mar", revenue: 3100000 }, { month: "Apr", revenue: 2650000 },
];

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  bg: "#0b0b0f",
  surface: "#13131a",
  card: "#1a1a24",
  border: "#2a2a38",
  borderLight: "#32324a",
  accent: "#c9a84c",
  accentDim: "#c9a84c22",
  accentBorder: "#c9a84c44",
  green: "#22c55e",
  greenDim: "#22c55e18",
  red: "#ef4444",
  redDim: "#ef444418",
  amber: "#f59e0b",
  amberDim: "#f59e0b18",
  text: "#f0eee8",
  muted: "#7a7890",
  subtle: "#3a3a50",
};

// Public brand colors
const P = {
  bg: "#f7f3ec",
  ink: "#0f0d0a",
  surface: "#faf8f4",
  accent: "#8b5e3c",
  accentLight: "#c49a6c",
  muted: "#b0a48a",
  warm: "#7a6a50",
  border: "#e0d8c8",
};

const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const fmtDate = (s) => new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const timeAgo = (s) => {
  const d = Math.floor((Date.now() - new Date(s)) / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: T.amber,  bg: T.amberDim },
  confirmed: { label: "Confirmed", color: T.green,  bg: T.greenDim },
  cancelled: { label: "Cancelled", color: T.red,    bg: T.redDim },
  invoiced:  { label: "Invoiced",  color: "#60a5fa", bg: "#60a5fa18" },
};

// ─────────────────────────────────────────────
// SHARED MICRO COMPONENTS
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.color}44`, padding: "3px 10px", borderRadius: 20, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>
      {c.label}
    </span>
  );
}

function Avatar({ initials, size = 36, bg = T.accentDim, color = T.accent }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color, flexShrink: 0, letterSpacing: 0.5 }}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "22px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 20 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || T.text, letterSpacing: -0.5, marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ data }) {
  const max = Math.max(...data.map(d => d.revenue));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", background: i === data.length - 1 ? T.accent : T.subtle, borderRadius: "4px 4px 0 0", height: `${(d.revenue / max) * 64}px`, transition: "height 0.5s ease", minHeight: 4 }} />
          <div style={{ fontSize: 9, color: T.muted, letterSpacing: 1 }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN — BOOKING DETAIL MODAL
// ─────────────────────────────────────────────
function BookingDetailModal({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking.status);
  const [invoiceAmt, setInvoiceAmt] = useState(booking.amount);
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("details");

  const save = () => { onUpdate({ ...booking, status, amount: invoiceAmt }); onClose(); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "#00000088", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 0", borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Avatar initials={booking.avatar} size={44} />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{booking.clientName}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{booking.email} · {booking.country}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {["details", "invoice", "note"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? `2px solid ${T.accent}` : "2px solid transparent", color: tab === t ? T.accent : T.muted, padding: "10px 18px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {tab === "details" && (
            <div>
              {[
                ["Booking ID", booking.id],
                ["Service", booking.service],
                ["Requested Date", fmtDate(booking.date)],
                ["Submitted", timeAgo(booking.createdAt)],
                ["Country", booking.country],
                ["Amount", fmt(booking.amount)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                  <span style={{ color: T.muted }}>{k}</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              {booking.message && (
                <div style={{ marginTop: 16, background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px" }}>
                  <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Client Message</div>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{booking.message}"</p>
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Update Status</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => setStatus(k)} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${status === k ? v.color : T.border}`, background: status === k ? v.bg : "transparent", color: status === k ? v.color : T.muted, fontSize: 11, letterSpacing: 1, cursor: "pointer" }}>{v.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={save} style={{ marginTop: 20, width: "100%", background: T.accent, color: T.bg, border: "none", padding: "13px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Save Changes</button>
            </div>
          )}

          {tab === "invoice" && (
            <div>
              <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.accent, letterSpacing: 1 }}>OSAM FITS</div>
                    <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, marginTop: 2 }}>INVOICE</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: T.muted }}>Invoice #INV-{booking.id.slice(-3)}</div>
                    <div style={{ fontSize: 11, color: T.muted }}>{new Date().toLocaleDateString("en-GB")}</div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Bill To</div>
                  <div style={{ fontSize: 14, color: T.text, fontWeight: 600 }}>{booking.clientName}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{booking.email}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{booking.country}</div>
                </div>
                <div style={{ background: T.surface, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                    <span style={{ color: T.muted }}>{booking.service}</span>
                    <span style={{ color: T.text }}>{fmt(invoiceAmt)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: T.muted }}>Date of Service</span>
                    <span style={{ color: T.text }}>{fmtDate(booking.date)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: T.accent }}>
                  <span>Total Due</span><span>{fmt(invoiceAmt)}</span>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Adjust Amount (₦)</div>
                <input type="number" value={invoiceAmt} onChange={e => setInvoiceAmt(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", background: T.bg, border: `1px solid ${T.border}`, color: T.text, padding: "11px 14px", borderRadius: 8, fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={() => { onUpdate({ ...booking, status: "invoiced", amount: invoiceAmt }); onClose(); }}
                style={{ width: "100%", background: T.accent, color: T.bg, border: "none", padding: "13px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>
                Send Invoice to Client ✦
              </button>
            </div>
          )}

          {tab === "note" && (
            <div>
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Internal Team Note</div>
              <textarea rows={6} placeholder="Add a note for your team about this booking..." value={note} onChange={e => setNote(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", background: T.bg, border: `1px solid ${T.border}`, color: T.text, padding: "12px 14px", borderRadius: 8, fontSize: 13, resize: "vertical", outline: "none", lineHeight: 1.6 }} />
              <button onClick={onClose} style={{ marginTop: 14, width: "100%", background: T.accent, color: T.bg, border: "none", padding: "13px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Save Note</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SETTINGS EDITOR (self-edit panel)
// ─────────────────────────────────────────────
function SettingsEditor() {
  const [profile, setProfile] = useState({
    name: DESIGNER.name,
    handle: DESIGNER.handle,
    title: DESIGNER.title,
    tagline: DESIGNER.tagline,
    location: DESIGNER.location,
    about: DESIGNER.about,
    spotsLeft: DESIGNER.spotsLeft,
  });
  const [services, setServices] = useState(DESIGNER.services.map((s,i) => ({...s, _id: i})));
  const [brands, setBrands] = useState(DESIGNER.brands.join("\n"));
  const [awards, setAwards] = useState(DESIGNER.awards.map(a => `${a.icon} ${a.title} (${a.year})`).join("\n"));
  const [press, setPress] = useState(DESIGNER.press.map(p => `${p.outlet} | ${p.title} | ${p.year}`).join("\n"));
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const inp = { width: "100%", boxSizing: "border-box", background: T.bg, border: `1px solid ${T.border}`, color: T.text, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit" };
  const lbl = { fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 6 };

  const handleSave = async () => {
    const updatedDesigner = {
      ...DESIGNER,
      ...profile,
      services,
      brands: brands.split("\n").map(b => b.trim()).filter(Boolean),
      awards: awards.split("\n").filter(Boolean).map(line => {
        const match = line.match(/^(.*?)\s+(.*?)\s*\((\d{4})\)$/);
        return match ? { icon: match[1].trim(), title: match[2].trim(), year: match[3] } : { icon: "✦", title: line, year: "" };
      }),
      press: press.split("\n").filter(Boolean).map(line => {
        const parts = line.split("|").map(p => p.trim());
        return { outlet: parts[0] || "", title: parts[1] || "", year: parts[2] || "" };
      }),
    };
    Object.assign(DESIGNER, updatedDesigner);
    await store.set("osam_brand_profile", updatedDesigner);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateService = (id, field, val) => setServices(ss => ss.map(s => s._id === id ? { ...s, [field]: val } : s));
  const addService = () => setServices(ss => [...ss, { _id: Date.now(), icon: "✦", title: "New Service", desc: "", price: "From ₦0", tag: "3+ weeks", spots: "Open" }]);
  const removeService = (id) => setServices(ss => ss.filter(s => s._id !== id));

  const TABS = ["profile", "services", "collaborations", "awards & press", "password"];

  return (
    <div style={{ maxWidth: 640 }}>
      {saved && (
        <div style={{ background: T.greenDim, border: `1px solid ${T.green}44`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 8 }}>
          ✓ Changes saved and live on your public profile!
        </div>
      )}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ background: "none", border: "none", borderBottom: activeTab === t ? `2px solid ${T.accent}` : "2px solid transparent", color: activeTab === t ? T.accent : T.muted, padding: "10px 16px", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div>
          <div style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: T.accent }}>
            ✦ These fields appear live on your public Osam Fits profile page.
          </div>
          {[
            ["name", "Brand Name", "text", "Osam Fits"],
            ["handle", "Social Handle", "text", "@osamfits"],
            ["title", "Brand Subtitle", "text", "Nigerian Fashion Brand · Serving Clients Globally"],
            ["tagline", "Tagline (shown in hero)", "text", "Crafted in Nigeria. Worn by the World."],
            ["location", "Location Line", "text", "🌍 Virtual · Nigeria-Based · Global Delivery"],
            ["spotsLeft", "Open Spots (shows urgency badge)", "number", "3"],
          ].map(([k, label, type, ph]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label style={lbl}>{label}</label>
              <input type={type} placeholder={ph} value={profile[k]} onChange={e => setProfile(p => ({ ...p, [k]: type === "number" ? Number(e.target.value) : e.target.value }))} style={inp} />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>About / Bio</label>
            <textarea rows={5} value={profile.about} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} style={{ ...inp, resize: "vertical" }} />
          </div>
          <button onClick={handleSave} style={{ background: T.accent, color: T.bg, border: "none", padding: "13px 28px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Save Profile ✦</button>
        </div>
      )}

      {activeTab === "services" && (
        <div>
          <div style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: T.accent }}>
            ✦ Edit, add, or remove services shown on your booking page.
          </div>
          {services.map((svc) => (
            <div key={svc._id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{svc.title || "Service"}</span>
                <button onClick={() => removeService(svc._id)} style={{ background: "none", border: `1px solid ${T.red}44`, color: T.red, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["title", "Service Name"], ["price", "Price (e.g. From ₦850,000)"], ["icon", "Icon (emoji)"], ["spots", "Availability (e.g. Open / 2 spots left)"]].map(([f, label]) => (
                  <div key={f}>
                    <label style={lbl}>{label}</label>
                    <input value={svc[f]} onChange={e => updateService(svc._id, f, e.target.value)} style={inp} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={lbl}>Description</label>
                <textarea rows={2} value={svc.desc} onChange={e => updateService(svc._id, "desc", e.target.value)} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
          ))}
          <button onClick={addService} style={{ background: "none", border: `1px solid ${T.accentBorder}`, color: T.accent, padding: "10px 20px", borderRadius: 8, fontSize: 12, cursor: "pointer", marginBottom: 16, width: "100%" }}>+ Add Service</button>
          <button onClick={handleSave} style={{ background: T.accent, color: T.bg, border: "none", padding: "13px 28px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Save Services ✦</button>
        </div>
      )}

      {activeTab === "collaborations" && (
        <div>
          <div style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: T.accent }}>
            ✦ One collaboration per line. These appear as brand logos on your public profile.
          </div>
          <label style={lbl}>Collaborations (one per line)</label>
          <textarea rows={8} value={brands} onChange={e => setBrands(e.target.value)} placeholder={"JMA — John Mayor Apparel\nAnother Brand Name\n..."} style={{ ...inp, resize: "vertical", marginBottom: 20 }} />
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 10 }}>Preview:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {brands.split("\n").filter(Boolean).map((b, i) => (
                <div key={i} style={{ padding: "6px 14px", border: `1px solid ${T.border}`, borderRadius: 20, fontSize: 12, color: T.muted }}>{b.trim()}</div>
              ))}
            </div>
          </div>
          <button onClick={handleSave} style={{ background: T.accent, color: T.bg, border: "none", padding: "13px 28px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Save Collaborations ✦</button>
        </div>
      )}

      {activeTab === "awards & press" && (
        <div>
          <div style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: T.accent }}>
            ✦ Leave these blank for now — add them as you earn them. They will appear automatically once added.
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Awards & Certifications (one per line)</label>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Format: emoji Title (Year) — e.g. 🏆 Best New Designer (2025)</div>
            <textarea rows={6} value={awards} onChange={e => setAwards(e.target.value)} placeholder={"Leave empty until you have awards to list.\ne.g. 🏆 Best New African Designer (2025)"} style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Press Mentions (one per line)</label>
            <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Format: Outlet | Article Title | Year — e.g. Vogue Africa | Rising Star | 2025</div>
            <textarea rows={6} value={press} onChange={e => setPress(e.target.value)} placeholder={"Leave empty until you have press coverage.\ne.g. Vogue Africa | The Brand to Watch | 2025"} style={{ ...inp, resize: "vertical" }} />
          </div>
          <button onClick={handleSave} style={{ background: T.accent, color: T.bg, border: "none", padding: "13px 28px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Save ✦</button>
        </div>
      )}

      {activeTab === "password" && (
        <div>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>Admin Password</div>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 20 }}>Your current demo password is <code style={{ background: T.bg, padding: "2px 8px", borderRadius: 4, color: T.accent }}>osam2025</code>. To change it in production, update the password check in the login section of the code.</p>
            <div style={{ background: T.bg, borderRadius: 8, padding: "14px 16px", fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
              💡 <strong style={{ color: T.text }}>Pro tip:</strong> When you deploy this app to a real hosting platform (Vercel, Netlify, etc.), replace the password check with a proper authentication service like Supabase Auth or Firebase Auth for full security.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard({ onExit }) {
  const [section, setSection] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [team, setTeam] = useState(SEED_TEAM);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [notifs, setNotifs] = useState([]);
  const [sideOpen, setSideOpen] = useState(true);
  const [newTeamMember, setNewTeamMember] = useState({ name: "", email: "", role: "", access: "bookings" });
  const [showAddTeam, setShowAddTeam] = useState(false);

  useEffect(() => {
    (async () => {
      const b = await store.get("osam_bookings");
      const c = await store.get("osam_clients");
      setBookings(b || SEED_BOOKINGS);
      setClients(c || SEED_CLIENTS);
    })();
  }, []);

  const saveBookings = async (updated) => { setBookings(updated); await store.set("osam_bookings", updated); };

  const updateBooking = async (updated) => {
    const next = bookings.map(b => b.id === updated.id ? updated : b);
    await saveBookings(next);
    setNotifs(n => [{ id: Date.now(), msg: `Booking for ${updated.clientName} updated to ${updated.status}.` }, ...n.slice(0, 4)]);
  };

  const totalRevenue = bookings.filter(b => b.status === "confirmed" || b.status === "invoiced").reduce((s, b) => s + Number(b.amount), 0);
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const countries = [...new Set(bookings.map(b => b.country))].length;

  const filteredBookings = bookings.filter(b => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch = !searchQ || b.clientName.toLowerCase().includes(searchQ.toLowerCase()) || b.service.toLowerCase().includes(searchQ.toLowerCase()) || b.country.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  const NAV = [
    { id: "overview", icon: "◈", label: "Overview" },
    { id: "bookings", icon: "📋", label: "Bookings", badge: pendingCount || null },
    { id: "clients", icon: "👥", label: "Clients" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "team", icon: "🔑", label: "Team" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: T.text, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)} }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${T.subtle};border-radius:2px}
        .nav-item:hover{background:${T.accentDim}!important;color:${T.accent}!important}
        .row-hover:hover{background:${T.card}!important}
        .btn-ghost:hover{background:${T.accentDim}!important;color:${T.accent}!important;border-color:${T.accentBorder}!important}
      `}</style>

      {/* Sidebar */}
      <div style={{ width: sideOpen ? 220 : 64, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s ease", overflow: "hidden", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        {/* Logo */}
        <div style={{ padding: sideOpen ? "24px 20px 20px" : "24px 12px 20px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: T.bg, flexShrink: 0 }}>OF</div>
            {sideOpen && <div><div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: 0.5 }}>Osam Fits</div><div style={{ fontSize: 10, color: T.muted }}>Admin Console</div></div>}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(n => (
            <button key={n.id} className="nav-item" onClick={() => setSection(n.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 8, border: "none", cursor: "pointer",
              background: section === n.id ? T.accentDim : "transparent",
              color: section === n.id ? T.accent : T.muted,
              fontSize: 13, fontWeight: section === n.id ? 600 : 400,
              marginBottom: 2, transition: "all 0.15s", textAlign: "left",
              whiteSpace: "nowrap", overflow: "hidden",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {sideOpen && <span style={{ flex: 1 }}>{n.label}</span>}
              {sideOpen && n.badge && <span style={{ background: T.amber, color: "#000", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 10 }}>{n.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Back to site */}
        <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.border}` }}>
          <button onClick={onExit} className="nav-item" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden" }}>
            <span style={{ flexShrink: 0 }}>←</span>
            {sideOpen && "View Public Site"}
          </button>
          <button onClick={() => setSideOpen(o => !o)} className="nav-item" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: T.muted, fontSize: 13, marginTop: 2 }}>
            <span style={{ flexShrink: 0 }}>{sideOpen ? "◀" : "▶"}</span>
            {sideOpen && "Collapse"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface, position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>
            {NAV.find(n => n.id === section)?.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {notifs.length > 0 && (
              <div style={{ position: "relative" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.amber, position: "absolute", top: -2, right: -2 }} />
                <span style={{ fontSize: 18, cursor: "pointer" }}>🔔</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar initials="OS" size={32} />
              <div style={{ fontSize: 12, color: T.muted }}>Osam</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px", animation: "fadeUp 0.35s ease" }}>

          {/* ── OVERVIEW ── */}
          {section === "overview" && (
            <div>
              {/* Notif banners */}
              {notifs.map(n => (
                <div key={n.id} style={{ background: T.accentDim, border: `1px solid ${T.accentBorder}`, borderRadius: 8, padding: "10px 16px", marginBottom: 12, fontSize: 13, color: T.accent, display: "flex", justifyContent: "space-between" }}>
                  <span>✦ {n.msg}</span>
                  <button onClick={() => setNotifs(ns => ns.filter(x => x.id !== n.id))} style={{ background: "none", border: "none", color: T.accent, cursor: "pointer" }}>✕</button>
                </div>
              ))}

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
                <StatCard label="Total Revenue" value={`₦${(totalRevenue / 1000000).toFixed(1)}M`} sub="Confirmed + Invoiced" icon="💰" accent={T.accent} />
                <StatCard label="Pending Bookings" value={pendingCount} sub="Awaiting your action" icon="⏳" accent={T.amber} />
                <StatCard label="Confirmed" value={confirmedCount} sub="This season" icon="✅" accent={T.green} />
                <StatCard label="Global Reach" value={`${countries} countries`} sub="Clients worldwide" icon="🌍" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
                {/* Revenue chart */}
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 22px" }}>
                  <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>Revenue Trend</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.accent, marginBottom: 16 }}>₦{(MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue / 1000000).toFixed(1)}M <span style={{ fontSize: 12, color: T.green }}>▲ this month</span></div>
                  <MiniBar data={MONTHLY_REVENUE} />
                </div>

                {/* Recent bookings */}
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 22px" }}>
                  <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Recent Requests</div>
                  {bookings.slice(0, 4).map((b, i) => (
                    <div key={i} onClick={() => { setSelectedBooking(b); }} className="row-hover" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none", cursor: "pointer", borderRadius: 4 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <Avatar initials={b.avatar} size={28} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{b.clientName}</div>
                          <div style={{ fontSize: 10, color: T.muted }}>{b.service}</div>
                        </div>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Quick Actions</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[
                    { label: "Review Pending", action: () => { setSection("bookings"); setFilterStatus("pending"); }, color: T.amber },
                    { label: "View All Clients", action: () => setSection("clients"), color: T.accent },
                    { label: "Analytics Report", action: () => setSection("analytics"), color: "#60a5fa" },
                    { label: "Manage Team", action: () => setSection("team"), color: T.green },
                  ].map((a, i) => (
                    <button key={i} onClick={a.action} style={{ background: "transparent", border: `1px solid ${a.color}44`, color: a.color, padding: "9px 18px", borderRadius: 8, fontSize: 12, cursor: "pointer", letterSpacing: 0.5, fontWeight: 500 }}>{a.label} →</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {section === "bookings" && (
            <div>
              {/* Filters */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                <input placeholder="Search by name, service, country..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  style={{ flex: 1, minWidth: 220, background: T.card, border: `1px solid ${T.border}`, color: T.text, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none" }} />
                <div style={{ display: "flex", gap: 6 }}>
                  {["all", "pending", "confirmed", "invoiced", "cancelled"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${filterStatus === s ? T.accent : T.border}`, background: filterStatus === s ? T.accentDim : "transparent", color: filterStatus === s ? T.accent : T.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr auto", gap: 0, padding: "12px 20px", borderBottom: `1px solid ${T.border}` }}>
                  {["Client", "Service", "Date", "Amount", "Status", ""].map(h => (
                    <div key={h} style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {filteredBookings.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: T.muted, fontSize: 14 }}>No bookings found.</div>
                )}
                {filteredBookings.map((b, i) => (
                  <div key={b.id} className="row-hover" onClick={() => setSelectedBooking(b)} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr auto", gap: 0, padding: "14px 20px", borderBottom: i < filteredBookings.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", alignItems: "center", transition: "background 0.15s" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar initials={b.avatar} size={32} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{b.clientName}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>🌍 {b.country}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: T.muted }}>{b.service}</div>
                    <div style={{ fontSize: 13, color: T.muted }}>{fmtDate(b.date)}</div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{fmt(b.amount)}</div>
                    <StatusBadge status={b.status} />
                    <div style={{ fontSize: 14, color: T.muted }}>→</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: T.muted }}>{filteredBookings.length} booking{filteredBookings.length !== 1 ? "s" : ""} shown</div>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {section === "clients" && (
            <div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: `1px solid ${T.border}` }}>
                  {["Client", "Country", "Bookings", "Total Spend", "Last Booking"].map(h => (
                    <div key={h} style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {clients.map((c, i) => (
                  <div key={c.id} className="row-hover" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: i < clients.length - 1 ? `1px solid ${T.border}` : "none", alignItems: "center", transition: "background 0.15s", cursor: "pointer" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar initials={c.avatar} size={34} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{c.email}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: T.muted }}>🌍 {c.country}</div>
                    <div style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{c.totalBookings}</div>
                    <div style={{ fontSize: 13, color: T.accent, fontWeight: 700 }}>{fmt(c.totalSpend)}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{fmtDate(c.lastBooking)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                <StatCard label="Total Clients" value={clients.length} icon="👥" />
                <StatCard label="Countries" value={[...new Set(clients.map(c => c.country))].length} icon="🌍" />
                <StatCard label="Top Spender" value={fmt(Math.max(...clients.map(c => c.totalSpend)))} icon="👑" accent={T.accent} />
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {section === "analytics" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
                <StatCard label="Total Revenue" value={`₦${(totalRevenue / 1000000).toFixed(2)}M`} icon="💰" accent={T.accent} />
                <StatCard label="Avg Booking Value" value={fmt(Math.round(totalRevenue / (bookings.filter(b => b.status !== "cancelled").length || 1)))} icon="📈" />
                <StatCard label="Conversion Rate" value="72%" sub="Pending → Confirmed" icon="🎯" accent={T.green} />
                <StatCard label="Repeat Clients" value={`${clients.filter(c => c.totalBookings > 1).length}`} sub="Booked 2+ times" icon="🔄" />
              </div>

              {/* Revenue bar chart */}
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Monthly Revenue (₦)</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
                  {MONTHLY_REVENUE.map((d, i) => {
                    const max = Math.max(...MONTHLY_REVENUE.map(x => x.revenue));
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 10, color: T.accent }}>{(d.revenue / 1000000).toFixed(1)}M</div>
                        <div style={{ width: "100%", background: i === MONTHLY_REVENUE.length - 1 ? T.accent : T.subtle, borderRadius: "6px 6px 0 0", height: `${(d.revenue / max) * 80}px`, minHeight: 8, transition: "height 0.6s ease" }} />
                        <div style={{ fontSize: 10, color: T.muted }}>{d.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Bookings by Service</div>
                  {["Bespoke Commission", "Brand Styling Mandate", "Speaking & Panels"].map((s, i) => {
                    const count = bookings.filter(b => b.service === s).length;
                    const pct = Math.round((count / bookings.length) * 100);
                    const colors = [T.accent, "#60a5fa", T.green];
                    return (
                      <div key={i} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: T.text }}>{s}</span>
                          <span style={{ color: colors[i] }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ background: T.bg, borderRadius: 4, height: 6 }}>
                          <div style={{ background: colors[i], borderRadius: 4, height: "100%", width: `${pct}%`, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px" }}>
                  <div style={{ fontSize: 11, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Top Client Countries</div>
                  {Object.entries(bookings.reduce((acc, b) => { acc[b.country] = (acc[b.country] || 0) + 1; return acc; }, {}))
                    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([country, count], i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                        <span style={{ color: T.text }}>🌍 {country}</span>
                        <span style={{ color: T.accent, fontWeight: 600 }}>{count} booking{count > 1 ? "s" : ""}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TEAM ── */}
          {section === "team" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: T.muted }}>{team.length} team member{team.length !== 1 ? "s" : ""}</div>
                <button onClick={() => setShowAddTeam(true)} style={{ background: T.accent, color: T.bg, border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>+ Add Member</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {team.map((m, i) => (
                  <div key={m.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <Avatar initials={m.avatar} size={42} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: T.muted }}>{m.email}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.accentBorder}`, padding: "4px 12px", borderRadius: 20, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>{m.role}</span>
                      <span style={{ background: T.greenDim, color: T.green, border: `1px solid ${T.green}44`, padding: "4px 12px", borderRadius: 20, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>{m.access} access</span>
                      {i > 0 && <button onClick={() => setTeam(t => t.filter(x => x.id !== m.id))} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Remove</button>}
                    </div>
                  </div>
                ))}
              </div>

              {showAddTeam && (
                <div style={{ background: T.card, border: `1px solid ${T.accentBorder}`, borderRadius: 12, padding: "24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 18 }}>Add Team Member</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[["name", "Full Name"], ["email", "Email Address"], ["role", "Job Title"]].map(([k, label]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                        <input value={newTeamMember[k]} onChange={e => setNewTeamMember(p => ({ ...p, [k]: e.target.value }))}
                          style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, color: T.text, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none" }} />
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize: 10, color: T.muted, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Access Level</div>
                      <select value={newTeamMember.access} onChange={e => setNewTeamMember(p => ({ ...p, access: e.target.value }))}
                        style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, color: T.text, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none" }}>
                        <option value="bookings">Bookings only</option>
                        <option value="clients">Clients only</option>
                        <option value="analytics">Analytics only</option>
                        <option value="full">Full access</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setShowAddTeam(false)} style={{ flex: 1, background: "none", border: `1px solid ${T.border}`, color: T.muted, padding: "11px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => {
                      if (!newTeamMember.name || !newTeamMember.email) return;
                      const initials = newTeamMember.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                      setTeam(t => [...t, { id: `tm${Date.now()}`, ...newTeamMember, avatar: initials, status: "active" }]);
                      setNewTeamMember({ name: "", email: "", role: "", access: "bookings" });
                      setShowAddTeam(false);
                    }} style={{ flex: 2, background: T.accent, color: T.bg, border: "none", padding: "11px", borderRadius: 8, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }}>Add Member</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS / SELF-EDIT ── */}
          {section === "settings" && (
            <SettingsEditor />
          )}
        </div>
      </div>

      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={(updated) => { updateBooking(updated); setSelectedBooking(null); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PUBLIC SITE (condensed from previous build)
// ─────────────────────────────────────────────
const DESIGNER_DEFAULTS = {
  name: "Osam Fits",
  handle: "@osamfits",
  title: "Nigerian Fashion Brand · Serving Clients Globally",
  tagline: "Crafted in Nigeria. Worn by the World.",
  location: "🌍 Virtual · Nigeria-Based · Global Delivery",
  about: "Osam Fits is a Nigeria-based virtual fashion brand built to serve clients across the globe. We blend bold Afrocentric identity with world-class tailoring — delivering bespoke commissions, brand styling, and creative consulting entirely online. No matter where you are in the world, Osam Fits brings the fit to you. All bookings require a minimum lead time of 3 weeks.",
  brands: ["JMA — John Mayor Apparel"],
  awards: [],
  press: [],
  clips: [],
  spotsLeft: 3,
  verified: true,
  services: [
    { icon: "✦", title: "Bespoke Commission", desc: "One-of-a-kind pieces designed around you — virtual consultation to global delivery.", price: "From ₦850,000", tag: "3+ weeks", spots: "Open" },
    { icon: "◈", title: "Brand Styling Mandate", desc: "Full virtual wardrobe direction for your campaign or personal brand.", price: "From ₦400,000", tag: "3+ weeks", spots: "Open" },
    { icon: "◉", title: "Speaking & Panels", desc: "Virtual keynotes and panels on African fashion and global brand building.", price: "From ₦200,000", tag: "3+ weeks", spots: "Open" },
  ],
};
let DESIGNER = { ...DESIGNER_DEFAULTS };

const CHAT_RESPONSES = ["Hello! Welcome to Osam Fits 👋 We're a Nigeria-based brand serving clients globally. How can we help?", "Our minimum lead time is 3 weeks for all services. Would you like to check availability?", "We handle everything virtually — consultations, fittings, and worldwide delivery!", "Only 2 bespoke slots remain this season. Shall we lock in your date?", "Yes, we ship worldwide! Measurements and fittings are handled completely online."];

const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 21); return d.toISOString().split("T")[0]; };
const getAvailableDates = () => { const dates = []; const start = new Date(); start.setDate(start.getDate() + 21); for (let i = 0; i < 60; i++) { const d = new Date(start); d.setDate(start.getDate() + i); const dow = d.getDay(); if (dow !== 0 && dow !== 6 && Math.random() > 0.35) dates.push(d.toISOString().split("T")[0]); } return dates; };
const AVAILABLE_DATES = getAvailableDates();

function PubBadge({ children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#8b5e3c18", color: P.accent, border: "1px solid #8b5e3c33", padding: "3px 10px", borderRadius: 20, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>{children}</span>;
}

function PubCalendar({ onSelect, selected }) {
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 21);
  const [month, setMonth] = useState(minDate.getMonth());
  const [year, setYear] = useState(minDate.getFullYear());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isAvailable = d => { if (!d) return false; const s = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; return AVAILABLE_DATES.includes(s); };
  const isPast = d => { if (!d) return true; return new Date(year, month, d) < minDate; };
  const handleDay = d => { if (!d || isPast(d) || !isAvailable(d)) return; onSelect(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`); };
  const prev = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const next = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1);
  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", color: P.warm, fontSize: 18 }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{new Date(year, month).toLocaleString("default", { month: "long" })} {year}</span>
        <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", color: P.warm, fontSize: 18 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, color: P.muted, padding: "4px 0", letterSpacing: 1 }}>{d}</div>)}
        {cells.map((d, i) => { const s = d ? `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : ""; const avail = isAvailable(d); const past = isPast(d); const sel = s === selected; return <div key={i} onClick={() => handleDay(d)} style={{ textAlign: "center", padding: "7px 0", borderRadius: 6, fontSize: 12, cursor: d && avail && !past ? "pointer" : "default", background: sel ? P.accent : avail && !past ? "#8b5e3c10" : "transparent", color: sel ? "#fff" : !d || past ? "#ccc" : avail ? P.accent : P.muted, fontWeight: avail && !past ? 600 : 400, border: avail && !past && !sel ? "1px solid #8b5e3c22" : "1px solid transparent" }}>{d || ""}</div>; })}
      </div>
    </div>
  );
}

function PubBookingModal({ service, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", country: "", company: "", date: "", message: "" });
  const [done, setDone] = useState(false);
  const steps = ["Service", "Date", "Details", "Confirm"];
  const inp = { width: "100%", boxSizing: "border-box", background: P.surface, border: `1px solid ${P.border}`, color: P.ink, padding: "11px 14px", borderRadius: 6, fontSize: 14, outline: "none", fontFamily: "inherit" };

  const handleSubmit = async () => {
    const newBooking = { id: `bk${Date.now()}`, clientName: form.name, email: form.email, country: form.country || "Unknown", service: service.title, date: form.date, amount: parseInt(service.price.replace(/[^0-9]/g, "")), currency: "NGN", status: "pending", message: form.message, createdAt: new Date().toISOString(), avatar: form.name.slice(0, 2).toUpperCase() };
    const existing = await store.get("osam_bookings") || SEED_BOOKINGS;
    await store.set("osam_bookings", [newBooking, ...existing]);
    onSubmit(newBooking);
    setDone(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#00000066", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: P.surface, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: "36px 32px", position: "relative", boxShadow: "0 24px 80px #00000033", fontFamily: "Georgia, serif" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 20, color: P.muted, cursor: "pointer" }}>✕</button>
        {!done ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: i <= step ? P.accent : "#e8e0d0", color: i <= step ? "#fff" : P.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i < step ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: i <= step ? P.accent : P.muted }}>{s}</span>
                  {i < 3 && <span style={{ color: "#e0d8c8" }}>—</span>}
                </div>
              ))}
            </div>
            <div style={{ background: "#8b5e3c10", border: "1px solid #8b5e3c22", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: P.accent }}>⏰ Minimum 3 weeks lead time · Earliest: <strong>{getMinDate()}</strong></div>
            {step === 0 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 16px" }}>Confirm Service</h3>
                <div style={{ border: `2px solid ${P.accent}`, borderRadius: 10, padding: "16px 20px", background: "#8b5e3c06", marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: P.ink }}>{service.icon} {service.title}</div>
                  <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>{service.desc}</div>
                  <div style={{ fontSize: 15, color: P.accent, fontWeight: 700, marginTop: 10 }}>{service.price}</div>
                </div>
                <button onClick={() => setStep(1)} style={{ width: "100%", background: P.accent, color: "#fff", border: "none", padding: "13px", borderRadius: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Choose a Date →</button>
              </div>
            )}
            {step === 1 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 16px" }}>Pick a Date</h3>
                <PubCalendar selected={form.date} onSelect={d => setForm(f => ({ ...f, date: d }))} />
                {form.date && <div style={{ marginTop: 10, background: "#8b5e3c10", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: P.accent }}>✓ {new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, background: "none", border: `1px solid ${P.border}`, color: P.warm, padding: "12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => form.date && setStep(2)} style={{ flex: 2, background: form.date ? P.accent : "#e0d8c8", color: form.date ? "#fff" : P.muted, border: "none", padding: "12px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: form.date ? "pointer" : "not-allowed" }}>Continue →</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 16px" }}>Your Details</h3>
                {[["name", "Full Name", "text", "Your full name"], ["email", "Email", "email", "you@example.com"], ["country", "Country", "text", "Where are you based?"], ["company", "Brand / Company", "text", "Optional"]].map(([k, label, type, ph]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: P.warm, display: "block", marginBottom: 6 }}>{label}</label>
                    <input type={type} placeholder={ph} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: P.warm, display: "block", marginBottom: 6 }}>Message</label>
                  <textarea rows={3} placeholder="Tell us about your vision..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inp, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: "none", border: `1px solid ${P.border}`, color: P.warm, padding: "12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => form.name && form.email && setStep(3)} style={{ flex: 2, background: form.name && form.email ? P.accent : "#e0d8c8", color: form.name && form.email ? "#fff" : P.muted, border: "none", padding: "12px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Review →</button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 20px" }}>Confirm Booking</h3>
                <div style={{ background: "#faf5ee", border: `1px solid ${P.border}`, borderRadius: 10, padding: "18px", marginBottom: 20 }}>
                  {[["Service", `${service.icon} ${service.title}`], ["Price", service.price], ["Date", form.date ? new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "—"], ["Name", form.name], ["Email", form.email], ["Country", form.country || "—"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${P.border}`, fontSize: 13 }}>
                      <span style={{ color: P.muted }}>{k}</span>
                      <span style={{ color: P.ink, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, background: "none", border: `1px solid ${P.border}`, color: P.warm, padding: "12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  <button onClick={handleSubmit} style={{ flex: 2, background: P.accent, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Send Request ✦</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <h3 style={{ color: P.accent, fontSize: 22, margin: "0 0 12px", fontWeight: 400 }}>Booking Request Sent!</h3>
            <p style={{ color: P.warm, fontSize: 14, lineHeight: 1.8 }}>Thank you, <strong>{form.name}</strong>! The Osam Fits team will confirm your <strong>{form.date ? new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : ""}</strong> appointment within 48 hours.</p>
            <button onClick={onClose} style={{ marginTop: 20, background: P.accent, color: "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PubChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: CHAT_RESPONSES[0] }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: "user", text: input }]);
    setInput(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMessages(m => [...m, { from: "bot", text: CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)] }]); }, 1100);
  };
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200, width: 54, height: 54, borderRadius: "50%", background: P.accent, border: "none", cursor: "pointer", boxShadow: "0 4px 24px #8b5e3c44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>{open ? "✕" : "💬"}</button>
      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 28, zIndex: 200, width: 310, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 16, boxShadow: "0 12px 48px #00000022", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: P.accent, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ffffff33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <div><div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Osam Fits Studio</div><div style={{ color: "#ffffff99", fontSize: 10 }}>Usually replies in minutes</div></div>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: m.from === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px", background: m.from === "user" ? P.accent : "#f0ebe0", color: m.from === "user" ? "#fff" : P.ink, fontSize: 13, lineHeight: 1.5 }}>{m.text}</div></div>)}
            {typing && <div style={{ display: "flex", gap: 4, padding: "6px 10px" }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: P.muted, animation: `bounce 1s ${i * 0.2}s infinite` }} />)}</div>}
            <div ref={ref} />
          </div>
          <div style={{ padding: "10px 10px", borderTop: `1px solid ${P.border}`, display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, background: "#f5f0e8", border: `1px solid ${P.border}`, color: P.ink, padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none" }} />
            <button onClick={send} style={{ background: P.accent, border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}


function PubBadge({ children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#8b5e3c18", color: P.accent, border: "1px solid #8b5e3c33", padding: "3px 10px", borderRadius: 20, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>{children}</span>;
}

function PubCalendar({ onSelect, selected }) {
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 21);
  const [month, setMonth] = useState(minDate.getMonth());
  const [year, setYear] = useState(minDate.getFullYear());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const isAvailable = d => { if (!d) return false; const s = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`; return AVAILABLE_DATES.includes(s); };
  const isPast = d => { if (!d) return true; return new Date(year, month, d) < minDate; };
  const handleDay = d => { if (!d || isPast(d) || !isAvailable(d)) return; onSelect(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`); };
  const prev = () => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1);
  const next = () => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1);
  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={prev} style={{ background: "none", border: "none", cursor: "pointer", color: P.warm, fontSize: 18 }}>‹</button>
        <span style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{new Date(year, month).toLocaleString("default", { month: "long" })} {year}</span>
        <button onClick={next} style={{ background: "none", border: "none", cursor: "pointer", color: P.warm, fontSize: 18 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, color: P.muted, padding: "4px 0", letterSpacing: 1 }}>{d}</div>)}
        {cells.map((d, i) => { const s = d ? `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : ""; const avail = isAvailable(d); const past = isPast(d); const sel = s === selected; return <div key={i} onClick={() => handleDay(d)} style={{ textAlign: "center", padding: "7px 0", borderRadius: 6, fontSize: 12, cursor: d && avail && !past ? "pointer" : "default", background: sel ? P.accent : avail && !past ? "#8b5e3c10" : "transparent", color: sel ? "#fff" : !d || past ? "#ccc" : avail ? P.accent : P.muted, fontWeight: avail && !past ? 600 : 400, border: avail && !past && !sel ? "1px solid #8b5e3c22" : "1px solid transparent" }}>{d || ""}</div>; })}
      </div>
    </div>
  );
}

function PubBookingModal({ service, onClose, onSubmit }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", country: "", company: "", date: "", message: "" });
  const [done, setDone] = useState(false);
  const steps = ["Service", "Date", "Details", "Confirm"];
  const inp = { width: "100%", boxSizing: "border-box", background: P.surface, border: `1px solid ${P.border}`, color: P.ink, padding: "11px 14px", borderRadius: 6, fontSize: 14, outline: "none", fontFamily: "inherit" };

  const handleSubmit = async () => {
    const newBooking = { id: `bk${Date.now()}`, clientName: form.name, email: form.email, country: form.country || "Unknown", service: service.title, date: form.date, amount: parseInt(service.price.replace(/[^0-9]/g, "")), currency: "NGN", status: "pending", message: form.message, createdAt: new Date().toISOString(), avatar: form.name.slice(0, 2).toUpperCase() };
    const existing = await store.get("osam_bookings") || SEED_BOOKINGS;
    await store.set("osam_bookings", [newBooking, ...existing]);
    onSubmit(newBooking);
    setDone(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#00000066", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: P.surface, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", padding: "36px 32px", position: "relative", boxShadow: "0 24px 80px #00000033", fontFamily: "Georgia, serif" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 20, color: P.muted, cursor: "pointer" }}>✕</button>
        {!done ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: i <= step ? P.accent : "#e8e0d0", color: i <= step ? "#fff" : P.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{i < step ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: i <= step ? P.accent : P.muted }}>{s}</span>
                  {i < 3 && <span style={{ color: "#e0d8c8" }}>—</span>}
                </div>
              ))}
            </div>
            <div style={{ background: "#8b5e3c10", border: "1px solid #8b5e3c22", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: P.accent }}>⏰ Minimum 3 weeks lead time · Earliest: <strong>{getMinDate()}</strong></div>
            {step === 0 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 16px" }}>Confirm Service</h3>
                <div style={{ border: `2px solid ${P.accent}`, borderRadius: 10, padding: "16px 20px", background: "#8b5e3c06", marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: P.ink }}>{service.icon} {service.title}</div>
                  <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>{service.desc}</div>
                  <div style={{ fontSize: 15, color: P.accent, fontWeight: 700, marginTop: 10 }}>{service.price}</div>
                </div>
                <button onClick={() => setStep(1)} style={{ width: "100%", background: P.accent, color: "#fff", border: "none", padding: "13px", borderRadius: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Choose a Date →</button>
              </div>
            )}
            {step === 1 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 16px" }}>Pick a Date</h3>
                <PubCalendar selected={form.date} onSelect={d => setForm(f => ({ ...f, date: d }))} />
                {form.date && <div style={{ marginTop: 10, background: "#8b5e3c10", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: P.accent }}>✓ {new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, background: "none", border: `1px solid ${P.border}`, color: P.warm, padding: "12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => form.date && setStep(2)} style={{ flex: 2, background: form.date ? P.accent : "#e0d8c8", color: form.date ? "#fff" : P.muted, border: "none", padding: "12px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: form.date ? "pointer" : "not-allowed" }}>Continue →</button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 16px" }}>Your Details</h3>
                {[["name", "Full Name", "text", "Your full name"], ["email", "Email", "email", "you@example.com"], ["country", "Country", "text", "Where are you based?"], ["company", "Brand / Company", "text", "Optional"]].map(([k, label, type, ph]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: P.warm, display: "block", marginBottom: 6 }}>{label}</label>
                    <input type={type} placeholder={ph} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
                  </div>
                ))}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: P.warm, display: "block", marginBottom: 6 }}>Message</label>
                  <textarea rows={3} placeholder="Tell us about your vision..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inp, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, background: "none", border: `1px solid ${P.border}`, color: P.warm, padding: "12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => form.name && form.email && setStep(3)} style={{ flex: 2, background: form.name && form.email ? P.accent : "#e0d8c8", color: form.name && form.email ? "#fff" : P.muted, border: "none", padding: "12px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Review →</button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h3 style={{ color: P.ink, fontSize: 17, fontWeight: 400, margin: "0 0 20px" }}>Confirm Booking</h3>
                <div style={{ background: "#faf5ee", border: `1px solid ${P.border}`, borderRadius: 10, padding: "18px", marginBottom: 20 }}>
                  {[["Service", `${service.icon} ${service.title}`], ["Price", service.price], ["Date", form.date ? new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "—"], ["Name", form.name], ["Email", form.email], ["Country", form.country || "—"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${P.border}`, fontSize: 13 }}>
                      <span style={{ color: P.muted }}>{k}</span>
                      <span style={{ color: P.ink, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, background: "none", border: `1px solid ${P.border}`, color: P.warm, padding: "12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Back</button>
                  <button onClick={handleSubmit} style={{ flex: 2, background: P.accent, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Send Request ✦</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
            <h3 style={{ color: P.accent, fontSize: 22, margin: "0 0 12px", fontWeight: 400 }}>Booking Request Sent!</h3>
            <p style={{ color: P.warm, fontSize: 14, lineHeight: 1.8 }}>Thank you, <strong>{form.name}</strong>! The Osam Fits team will confirm your <strong>{form.date ? new Date(form.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long" }) : ""}</strong> appointment within 48 hours.</p>
            <button onClick={onClose} style={{ marginTop: 20, background: P.accent, color: "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PubChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: CHAT_RESPONSES[0] }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);
  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { from: "user", text: input }]);
    setInput(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMessages(m => [...m, { from: "bot", text: CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)] }]); }, 1100);
  };
  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200, width: 54, height: 54, borderRadius: "50%", background: P.accent, border: "none", cursor: "pointer", boxShadow: "0 4px 24px #8b5e3c44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>{open ? "✕" : "💬"}</button>
      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 28, zIndex: 200, width: 310, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 16, boxShadow: "0 12px 48px #00000022", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: P.accent, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ffffff33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <div><div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Osam Fits Studio</div><div style={{ color: "#ffffff99", fontSize: 10 }}>Usually replies in minutes</div></div>
          </div>
          <div style={{ maxHeight: 240, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: m.from === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px", background: m.from === "user" ? P.accent : "#f0ebe0", color: m.from === "user" ? "#fff" : P.ink, fontSize: 13, lineHeight: 1.5 }}>{m.text}</div></div>)}
            {typing && <div style={{ display: "flex", gap: 4, padding: "6px 10px" }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: P.muted, animation: `bounce 1s ${i * 0.2}s infinite` }} />)}</div>}
            <div ref={ref} />
          </div>
          <div style={{ padding: "10px 10px", borderTop: `1px solid ${P.border}`, display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, background: "#f5f0e8", border: `1px solid ${P.border}`, color: P.ink, padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none" }} />
            <button onClick={send} style={{ background: P.accent, border: "none", color: "#fff", width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

function PublicSite({ onAdminClick }) {
  const [tab, setTab] = useState("about");
  const [bookingService, setBookingService] = useState(null);
  const [brand, setBrand] = useState(DESIGNER);

  useEffect(() => {
    store.get("osam_brand_profile").then(saved => {
      if (saved) { Object.assign(DESIGNER, saved); setBrand({ ...DESIGNER }); }
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: "Georgia, serif", color: P.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        * { -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:scale(0)}40%{transform:scale(1)} }
        .pub-tab:hover { color: #8b5e3c !important; }
        .pub-svc:hover { border-color: #c49a6c !important; box-shadow: 0 6px 24px #8b5e3c12 !important; }
      `}</style>

      {/* Admin access bar */}
      <div style={{ background: P.ink, padding: "8px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#5a4e3a", letterSpacing: 2, textTransform: "uppercase" }}>Osam Fits © 2025 · Nigeria · Global</span>
        <button onClick={onAdminClick} style={{ background: "none", border: "1px solid #3a3020", color: "#6a5a40", padding: "5px 14px", borderRadius: 4, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Admin →</button>
      </div>

      <div style={{ height: 2, background: `linear-gradient(90deg, ${P.accent}, #c49a6c, ${P.accent})` }} />

      {/* Hero */}
      <div style={{ background: P.ink, color: "#f0ede6", padding: "60px 24px 50px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", background: `linear-gradient(135deg, ${P.accent}, #5a3820)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#c49a6c", fontWeight: 900, border: "3px solid #c49a6c33", margin: "0 auto", letterSpacing: 1 }}>OF</div>
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: "50%", background: P.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: `2px solid ${P.ink}`, color: "#fff" }}>✓</div>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 5, color: "#c49a6c", marginBottom: 10, textTransform: "uppercase" }}>Fashion Brand · Creative Studio</div>
          <h1 style={{ fontSize: "clamp(36px,6vw,56px)", fontWeight: 300, margin: "0 0 8px", fontFamily: "Cormorant Garamond, Georgia", letterSpacing: 1 }}>{DESIGNER.name}</h1>
          <p style={{ fontSize: 13, color: "#6a5a44", margin: "0 0 16px" }}>{DESIGNER.location}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            <PubBadge>✓ Verified</PubBadge><PubBadge>⏰ 3-Week Min</PubBadge><PubBadge>🌍 Ships Worldwide</PubBadge>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#c0392b18", color: "#e05555", border: "1px solid #c0392b33", padding: "3px 10px", borderRadius: 20, fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>🔥 {DESIGNER.spotsLeft} Spots Left</span>
          </div>
          <p style={{ fontSize: "clamp(16px,3vw,20px)", fontStyle: "italic", color: "#b0a08a", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6, fontFamily: "Cormorant Garamond" }}>"{DESIGNER.tagline}"</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "#ffffff08", borderRadius: 10, overflow: "hidden", border: "1px solid #ffffff0a", marginBottom: 28 }}>
            {DESIGNER.stats.map((s, i) => <div key={i} style={{ padding: "16px 8px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 600, color: "#c49a6c" }}>{s.value}</div><div style={{ fontSize: 9, color: "#5a4e3a", textTransform: "uppercase", letterSpacing: 2, marginTop: 4 }}>{s.label}</div></div>)}
          </div>
          <button onClick={() => setBookingService(DESIGNER.services[0])} style={{ background: `linear-gradient(135deg, ${P.accent}, #6a4020)`, color: "#fff", border: "none", padding: "15px 44px", borderRadius: 4, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer" }}>Book a Consultation ✦</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${P.border}`, background: P.surface, position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ display: "flex", justifyContent: "center", maxWidth: 760, margin: "0 auto", overflowX: "auto" }}>
          {["about", "services", "media", "press"].map(t => (
            <button key={t} className="pub-tab" onClick={() => setTab(t)} style={{ background: "none", border: "none", borderBottom: tab === t ? `2px solid ${P.accent}` : "2px solid transparent", color: tab === t ? P.accent : P.muted, padding: "15px 22px", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "44px 24px 100px", animation: "fadeUp 0.4s ease" }}>
        {tab === "about" && (
          <div>
            <p style={{ fontSize: 16, lineHeight: 2, color: "#5a4e3a", textAlign: "center", maxWidth: 580, margin: "0 auto 44px", fontStyle: "italic" }}>{brand.about}</p>
            {brand.awards && brand.awards.length > 0 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 12 }}><div style={{ fontSize: 10, letterSpacing: 5, color: P.accentLight, textTransform: "uppercase", marginBottom: 8 }}>Recognition</div><h2 style={{ fontSize: 28, fontWeight: 400, color: P.ink, margin: 0 }}>Awards & Certifications</h2><div style={{ width: 40, height: 1, background: P.accent, margin: "14px auto 28px" }} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 44 }}>
                  {brand.awards.map((a, i) => <div key={i} style={{ border: `1px solid ${P.border}`, borderRadius: 10, padding: "16px 18px", background: P.surface, display: "flex", gap: 12 }}><span style={{ fontSize: 20 }}>{a.icon}</span><div><div style={{ fontSize: 13, fontWeight: 600, color: P.ink }}>{a.title}</div><div style={{ fontSize: 11, color: P.muted }}>{a.year}</div></div></div>)}
                </div>
              </div>
            )}
            {brand.brands && brand.brands.length > 0 && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 10, letterSpacing: 5, color: P.accentLight, textTransform: "uppercase", marginBottom: 8 }}>Collaborations</div><h2 style={{ fontSize: 28, fontWeight: 400, color: P.ink, margin: "0 0 24px" }}>Brands Worked With</h2></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {brand.brands.map((b, i) => <div key={i} style={{ padding: "8px 20px", border: `1px solid ${P.border}`, borderRadius: 30, fontSize: 12, color: P.warm, background: P.surface }}>{b}</div>)}
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "services" && (
          <div>
            <div style={{ background: "#8b5e3c10", border: "1px solid #8b5e3c22", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: P.accent, display: "flex", gap: 8 }}>⏰ All services require a minimum of <strong>3 weeks</strong> advance booking.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {DESIGNER.services.map((svc, i) => (
                <div key={i} className="pub-svc" style={{ border: `1px solid ${P.border}`, borderRadius: 12, padding: "24px 26px", background: P.surface, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", transition: "all 0.2s" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 18, color: P.accent }}>{svc.icon}</span><span style={{ fontSize: 15, fontWeight: 600 }}>{svc.title}</span><PubBadge>{svc.spots}</PubBadge></div>
                    <p style={{ fontSize: 13, color: P.muted, lineHeight: 1.7, margin: 0 }}>{svc.desc}</p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div style={{ fontSize: 14, color: P.accent, fontWeight: 700, marginBottom: 12 }}>{svc.price}</div>
                    <button onClick={() => setBookingService(svc)} style={{ background: P.accent, color: "#fff", border: "none", padding: "9px 22px", borderRadius: 6, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Book →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "media" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 44 }}>
              {DESIGNER.clips.map((c, i) => (
                <div key={i} style={{ border: `1px solid ${P.border}`, borderRadius: 12, padding: "20px 22px", background: P.surface, display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}>
                  <div style={{ width: 50, height: 50, borderRadius: 10, background: "#8b5e3c10", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{c.type === "podcast" ? "🎙" : c.type === "talk" ? "🎤" : "🎬"}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{c.title}</div><div style={{ fontSize: 12, color: P.muted }}>{c.desc}</div></div>
                  <PubBadge>{c.duration}</PubBadge>
                </div>
              ))}
            </div>
            <div style={{ background: P.ink, borderRadius: 14, padding: "30px", textAlign: "center", color: "#f0ede6" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>✦</div>
              <h3 style={{ fontSize: 18, fontWeight: 300, margin: "0 0 8px", fontFamily: "Cormorant Garamond" }}>Osam Fits — Official Media Kit</h3>
              <p style={{ fontSize: 13, color: "#8a7a60", margin: "0 0 20px", lineHeight: 1.7 }}>Brand story, high-res photos, global stats, collaborations & press quotes.</p>
              <button style={{ background: `linear-gradient(135deg, ${P.accent}, #6a4020)`, color: "#fff", border: "none", padding: "11px 28px", borderRadius: 6, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>Download Media Kit</button>
            </div>
          </div>
        )}
        {tab === "press" && (
          <div>
            <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden", background: P.surface, marginBottom: 36 }}>
              {DESIGNER.press.map((p, i) => (
                <div key={i} style={{ padding: "18px 22px", borderBottom: i < DESIGNER.press.length - 1 ? `1px solid #f0e8d8` : "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div><div style={{ fontSize: 10, color: P.accent, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{p.outlet}</div><div style={{ fontSize: 14 }}>{p.title}</div></div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span style={{ fontSize: 12, color: P.muted }}>{p.year}</span><span style={{ color: P.accent }}>→</span></div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {DESIGNER.brands.map((b, i) => <div key={i} style={{ border: `1px solid ${P.border}`, borderRadius: 10, padding: "16px 8px", textAlign: "center", background: P.surface }}><div style={{ fontSize: 20, marginBottom: 6, color: P.accent }}>◈</div><div style={{ fontSize: 11, color: P.warm }}>{b}</div></div>)}
            </div>
          </div>
        )}
      </div>

      {bookingService && <PubBookingModal service={bookingService} onClose={() => setBookingService(null)} onSubmit={() => {}} />}
      <PubChat />
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("public");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminErr, setAdminErr] = useState(false);

  const handleAdminClick = () => { setView("login"); setAdminErr(false); };
  const handleLogin = () => {
    if (adminPwd === "osam2025" || adminPwd === "") { setAdminAuthed(true); setView("admin"); }
    else { setAdminErr(true); }
  };

  if (view === "login" && !adminAuthed) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: "44px 40px", width: "100%", maxWidth: 380, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: T.bg, margin: "0 auto 20px", letterSpacing: 1 }}>OF</div>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Admin Access</h2>
          <p style={{ color: T.muted, fontSize: 13, margin: "0 0 28px" }}>Osam Fits Admin Console</p>
          <div style={{ marginBottom: 14 }}>
            <input type="password" placeholder="Enter admin password" value={adminPwd} onChange={e => { setAdminPwd(e.target.value); setAdminErr(false); }} onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", boxSizing: "border-box", background: T.bg, border: `1px solid ${adminErr ? T.red : T.border}`, color: T.text, padding: "12px 16px", borderRadius: 8, fontSize: 14, outline: "none" }} />
            {adminErr && <div style={{ color: T.red, fontSize: 11, marginTop: 6, textAlign: "left" }}>Incorrect password. Try "osam2025"</div>}
          </div>
          <button onClick={handleLogin} style={{ width: "100%", background: T.accent, color: T.bg, border: "none", padding: "13px", borderRadius: 8, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700, marginBottom: 12 }}>Sign In →</button>
          <button onClick={() => setView("public")} style={{ background: "none", border: "none", color: T.muted, fontSize: 12, cursor: "pointer" }}>← Back to Osam Fits</button>
          <p style={{ color: T.subtle, fontSize: 10, marginTop: 16 }}>Demo password: osam2025</p>
        </div>
      </div>
    );
  }

  if (view === "admin" && adminAuthed) return <AdminDashboard onExit={() => setView("public")} />;
  return <PublicSite onAdminClick={handleAdminClick} />;
}
