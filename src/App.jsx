import { useState, useEffect } from "react";
import {
  Truck, Package, Home, Building, Car, Globe, Phone, Mail, MapPin,
  CheckCircle, AlertCircle, Settings, X, Calendar, Shield, Clock,
  Star, ArrowRight, ChevronRight, Warehouse, Send, MessageSquare,
  User, Info, Copy, Check, ExternalLink, Menu
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  CONFIG — fill in your credentials before deploying
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  company: {
    name: "Neelam",
    fullName: "Neelam Packers & Movers",
    tagline: "Packers & Movers",
    phone: "+91 98765 43210",
    email: "hello@neelampackers.in",
    whatsappDisplay: "+91 98765 43210",
    address: "Transport Nagar, Kanpur, Uttar Pradesh",
  },
  emailjs: {
    serviceId:  "service_dmpbeai",   // https://emailjs.com → Email Services
    templateId: "template_rg84cqq",  // EmailJS → Email Templates
    publicKey:  "zpX7WCwFeEbucEl_y",   // EmailJS → Account → Public Key
  },
  callmebot: {
    adminPhone: "919876543210",              // Country code + number, no +
    apiKey:     "YOUR_CALLMEBOT_API_KEY",    // See setup guide inside app
  },
  googleSheets: {
    webhookUrl: "YOUR_APPS_SCRIPT_DEPLOY_URL", // See setup guide inside app
  },
};

const SERVICES = [
  { icon: Home,      title: "Home Relocation",   desc: "Complete household shifting with professional packing, safe loading & on-time delivery." },
  { icon: Building,  title: "Office Moving",      desc: "Minimal downtime office shifting. IT equipment, furniture & documents handled with care." },
  { icon: Car,       title: "Vehicle Transport",  desc: "Bike & car transport via enclosed carriers. GPS tracked & fully insured transit." },
  { icon: Package,   title: "Packing Services",   desc: "Premium bubble wrap, sturdy boxes & foam padding. Fragile items get extra protection." },
  { icon: Globe,     title: "International Move", desc: "Door-to-door international relocation with customs clearance & sea/air freight options." },
  { icon: Warehouse, title: "Warehouse Storage",  desc: "Secure, climate-controlled storage units. Short-term or long-term — flexible plans." },
];

const STEPS = [
  { n: "01", title: "Request a Quote",  desc: "Fill the form with your move details and we respond within 2 hours." },
  { n: "02", title: "Free Survey",      desc: "Our executive visits, assesses items & provides a final fixed quote." },
  { n: "03", title: "We Pack & Move",   desc: "Professional packers handle everything — loading, transport, unloading." },
  { n: "04", title: "Safe Delivery",    desc: "Real-time tracking, on-time delivery & unpacking at your new place." },
];

const SETUP_STEPS = [
  {
    label: "EmailJS (free email alerts)",
    color: "#0ea5e9",
    steps: [
      "Go to emailjs.com → Sign up free",
      "Add an Email Service (Gmail/Outlook) → copy Service ID",
      'Create a Template — use variables like {{from_name}}, {{phone}}, {{from_city}}, {{to_city}}, {{move_date}}, {{message}} → copy Template ID',
      "Account → General → copy Public Key",
      "Paste all 3 values in CONFIG.emailjs above",
    ],
  },
  {
    label: "CallMeBot (free WhatsApp alerts)",
    color: "#22c55e",
    steps: [
      "Save +34 644 597 290 as a contact on WhatsApp",
      'Send this exact message: "I allow callmebot to send me messages"',
      "You'll receive your API key in ~1 minute via WhatsApp",
      "Set CONFIG.callmebot.adminPhone = your number with country code (e.g. 919876543210)",
      "Set CONFIG.callmebot.apiKey = the key you received",
    ],
  },
  {
    label: "Google Sheets (data storage)",
    color: "#f59e0b",
    steps: [
      "Create a Google Sheet with columns: Timestamp, Type, Name, Phone, Email, From, To, Date, Move Type, Size, Message",
      "In the Sheet: Extensions → Apps Script → paste the script from the code comment below",
      "Click Deploy → New Deployment → Type: Web App → Execute as: Me → Who has access: Anyone",
      "Copy the Web App URL",
      "Paste it in CONFIG.googleSheets.webhookUrl",
    ],
    note: "Apps Script code: paste in script editor:\nfunction doGet(e){var ss=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();var p=e.parameter;ss.appendRow([new Date(),p.type||'',p.name||'',p.phone||'',p.email||'',p.fromCity||'',p.toCity||'',p.moveDate||'',p.moveType||'',p.propertySize||'',p.message||'']);return ContentService.createTextOutput('OK');}",
  },
];

function isConfigured(key) {
  if (key === "emailjs") return !CONFIG.emailjs.serviceId.startsWith("YOUR");
  if (key === "callmebot") return !CONFIG.callmebot.apiKey.startsWith("YOUR");
  if (key === "sheets") return !CONFIG.googleSheets.webhookUrl.startsWith("YOUR");
  return false;
}

// ─── API Helpers ───────────────────────────────────────────────
async function saveToSheets(data) {
  if (!isConfigured("sheets")) return { skipped: true };
  const params = new URLSearchParams(data).toString();
  await fetch(`${CONFIG.googleSheets.webhookUrl}?${params}`, { mode: "no-cors" });
  return { ok: true };
}

async function sendEmail(data) {
  if (!isConfigured("emailjs")) return { skipped: true };
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:      CONFIG.emailjs.serviceId,
      template_id:     CONFIG.emailjs.templateId,
      user_id:         CONFIG.emailjs.publicKey,
      template_params: { ...data, to_email: CONFIG.company.email },
    }),
  });
  if (!res.ok) throw new Error("EmailJS failed");
  return { ok: true };
}

async function sendWhatsApp(msg) {
  if (!isConfigured("callmebot")) return { skipped: true };
  const url = `https://api.callmebot.com/whatsapp.php?phone=${CONFIG.callmebot.adminPhone}&text=${encodeURIComponent(msg)}&apikey=${CONFIG.callmebot.apiKey}`;
  await fetch(url, { mode: "no-cors" });
  return { ok: true };
}

// ─── Sub-components ────────────────────────────────────────────
function Badge({ ok }) {
  return ok
    ? <span style={{ background: "#dcfce7", color: "#166534", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>✓ configured</span>
    : <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>⚠ needs setup</span>;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#22c55e" : "#6b7280", padding: "2px 6px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 }}>
      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
    </button>
  );
}

function SetupGuide({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 16, maxWidth: 680, width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", position: "relative" }}>
        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Integration Setup Guide</h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>3 free services to power notifications & storage</p>
          </div>
          <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {SETUP_STEPS.map((s, i) => (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: s.color + "15", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{i + 1}. {s.label}</span>
                <Badge ok={isConfigured(["emailjs","callmebot","sheets"][i])} />
              </div>
              <div style={{ padding: "14px 16px" }}>
                <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {s.steps.map((step, j) => (
                    <li key={j} style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{step}</li>
                  ))}
                </ol>
                {s.note && (
                  <div style={{ marginTop: 12, background: "#1e293b", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <code style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "pre-wrap", lineHeight: 1.6, fontFamily: "monospace" }}>{s.note}</code>
                    <CopyButton text={s.note.replace("Apps Script code: paste in script editor:\n", "")} />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "#166534" }}>
            <strong>✓ Once all 3 are configured</strong>, every form submission will: save to your Google Sheet, email you, and send a WhatsApp notification — all automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("book");
  const [status, setStatus] = useState("idle");
  const [showSetup, setShowSetup] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    fromCity: "", toCity: "", moveDate: "",
    moveType: "home", propertySize: "2bhk",
    notes: "", message: "",
  });

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileMenu(false); };

  const handleSubmit = async () => {
    const isBook = tab === "book";
    const required = isBook
      ? [form.name, form.phone, form.email, form.fromCity, form.toCity, form.moveDate]
      : [form.name, form.phone, form.email, form.message];

    if (required.some((v) => !v.trim())) {
      alert("Please fill all required fields (*)");
      return;
    }

    setStatus("loading");
    try {
      const data = isBook
        ? { type: "Booking Request", name: form.name, phone: form.phone, email: form.email, fromCity: form.fromCity, toCity: form.toCity, moveDate: form.moveDate, moveType: form.moveType, propertySize: form.propertySize, message: form.notes }
        : { type: "Query", name: form.name, phone: form.phone, email: form.email, message: form.message };

      const waMsg = isBook
        ? `🚛 New Booking!\nName: ${form.name}\nPhone: ${form.phone}\n📍 ${form.fromCity} → ${form.toCity}\n📅 ${form.moveDate}\nType: ${form.moveType.toUpperCase()}`
        : `❓ New Query!\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nMsg: ${form.message.slice(0, 100)}`;

      await Promise.allSettled([
        saveToSheets(data),
        sendEmail({ ...data, from_name: form.name, from_city: form.fromCity, to_city: form.toCity, move_date: form.moveDate }),
        sendWhatsApp(waMsg),
      ]);

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setForm({ name: "", phone: "", email: "", fromCity: "", toCity: "", moveDate: "", moveType: "home", propertySize: "2bhk", notes: "", message: "" });
  };

  const configured = ["emailjs","callmebot","sheets"].filter(k => isConfigured(k)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Outfit', sans-serif; }
        .swift-input { width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-family: 'Outfit',sans-serif; font-size: 14px; color: #111827; outline: none; transition: border 0.15s; background: #fff; }
        .swift-input:focus { border-color: #ea580c; }
        .swift-input::placeholder { color: #9ca3af; }
        select.swift-input { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .swift-btn { background: #ea580c; color: #fff; border: none; border-radius: 10px; padding: 13px 28px; font-family: 'Outfit',sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.15s, transform 0.1s; display: flex; align-items: center; gap: 8px; }
        .swift-btn:hover { background: #c2410c; }
        .swift-btn:active { transform: scale(0.98); }
        .swift-btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .tab-btn { padding: 10px 24px; border-radius: 8px; border: none; font-family: 'Outfit',sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .tab-btn.active { background: #ea580c; color: #fff; }
        .tab-btn.inactive { background: #f3f4f6; color: #6b7280; }
        .tab-btn.inactive:hover { background: #e5e7eb; }
        .service-card { background: #fff; border: 1.5px solid #f3f4f6; border-radius: 14px; padding: 24px; transition: all 0.2s; cursor: default; }
        .service-card:hover { border-color: #fdba74; box-shadow: 0 8px 24px rgba(234,88,12,0.1); transform: translateY(-2px); }
        .nav-link { background: none; border: none; font-family: 'Outfit',sans-serif; font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.85); cursor: pointer; padding: 8px 4px; transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: #fff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "#ea580c", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={20} color="#fff" />
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>
              {CONFIG.company.name}<span style={{ color: "#fb923c", fontWeight: 400, fontSize: 13, marginLeft: 4 }}>Packers & Movers</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["Services","How It Works","Book Now"].map((l, i) => (
              <button key={i} className="nav-link" onClick={() => scrollTo(["services","how-it-works","booking"][i])}>
                {l}
              </button>
            ))}
            <button onClick={() => setShowSetup(true)} title="Setup Integrations" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 8, position: "relative" }}>
              <Settings size={16} color="#fff" />
              {configured < 3 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, background: "#f59e0b", borderRadius: "50%", border: "1px solid #0f172a" }} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0c1a2e 100%)", padding: "80px 24px 90px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 20% 50%, rgba(234,88,12,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,146,60,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 740, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.3)", borderRadius: 99, padding: "6px 16px", marginBottom: 28 }}>
            <Star size={14} color="#fb923c" fill="#fb923c" />
            <span style={{ color: "#fb923c", fontSize: 13, fontWeight: 600 }}>Trusted by 10,000+ families across India</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,6vw,62px)", fontWeight: 900, color: "#fff", margin: "0 0 20px", lineHeight: 1.1 }}>
            Move Anywhere,<br /><span style={{ color: "#fb923c" }}>Stress-Free.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", marginBottom: 40, lineHeight: 1.6 }}>
            Professional packing, safe transit & on-time delivery — home, office, vehicle or international. Fixed quotes, zero hidden charges.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="swift-btn" style={{ fontSize: 16, padding: "14px 32px" }} onClick={() => scrollTo("booking")}>
              Get Free Quote <ArrowRight size={18} />
            </button>
            <a href={`tel:${CONFIG.company.phone}`} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "14px 28px", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 15, transition: "background 0.15s" }}>
              <Phone size={17} /> {CONFIG.company.phone}
            </a>
          </div>

          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
            {[["10K+","Happy Customers"],["15+","Years Experience"],["500+","Cities Covered"],["100%","Insured Goods"]].map(([v, l], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fb923c" }}>{v}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: "#fff7ed", borderTop: "1px solid #fed7aa", borderBottom: "1px solid #fed7aa", padding: "14px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {[[Shield,"Fully Insured Moves"],[Clock,"On-Time Guarantee"],[Star,"GPS Tracked Transit"],[CheckCircle,"Free Cancellation"]].map(([Icon, t], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#c2410c" }}>
              <Icon size={16} />{t}
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section id="services" style={{ background: "#f8fafc", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ color: "#ea580c", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5 }}>What We Do</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#111827", margin: "10px 0 14px" }}>Comprehensive Moving Services</h2>
            <p style={{ color: "#6b7280", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>From a single item to an entire office — we handle every kind of relocation with care.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {SERVICES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="service-card">
                <div style={{ width: 48, height: 48, background: "#fff7ed", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={24} color="#ea580c" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: "#fff", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <span style={{ color: "#ea580c", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5 }}>Process</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800, color: "#111827", margin: "10px 0" }}>How It Works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
            {STEPS.map(({ n, title, desc }, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ width: 56, height: 56, background: i % 2 === 0 ? "#ea580c" : "#fff7ed", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: i % 2 !== 0 ? "2px solid #fed7aa" : "none" }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: i % 2 === 0 ? "#fff" : "#ea580c" }}>{n}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING / QUERY FORM ── */}
      <section id="booking" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <span style={{ color: "#fb923c", fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5 }}>Get in Touch</span>
            <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, color: "#fff", margin: "10px 0 12px" }}>Book a Move or Ask a Query</h2>
            <p style={{ color: "#94a3b8", fontSize: 15 }}>We respond within 2 hours — free quote, no obligation.</p>
          </div>

          <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.35)" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, padding: "20px 24px 0", borderBottom: "1px solid #f3f4f6", paddingBottom: 16 }}>
              <button className={`tab-btn ${tab === "book" ? "active" : "inactive"}`} onClick={() => { setTab("book"); setStatus("idle"); }}>
                🚛 Book a Move
              </button>
              <button className={`tab-btn ${tab === "query" ? "active" : "inactive"}`} onClick={() => { setTab("query"); setStatus("idle"); }}>
                💬 Ask a Query
              </button>
            </div>

            <div style={{ padding: "28px 28px 32px" }}>
              {status === "success" ? (
                <div className="fade-in" style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <CheckCircle size={36} color="#16a34a" />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>Request Received!</h3>
                  <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 28 }}>
                    Thank you! We've saved your details and our team will contact you within 2 hours.
                    {isConfigured("emailjs") && " A confirmation has been sent to your email."}
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="swift-btn" onClick={resetForm}>Submit Another</button>
                    <a href={`tel:${CONFIG.company.phone}`} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f3f4f6", border: "none", borderRadius: 10, padding: "13px 24px", color: "#111827", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
                      <Phone size={16} /> Call Us Now
                    </a>
                  </div>
                </div>
              ) : status === "error" ? (
                <div className="fade-in" style={{ textAlign: "center", padding: "32px 20px" }}>
                  <div style={{ width: 64, height: 64, background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <AlertCircle size={30} color="#dc2626" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Something went wrong</h3>
                  <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 20 }}>Please try again or call us directly.</p>
                  <button className="swift-btn" onClick={() => setStatus("idle")}>Try Again</button>
                </div>
              ) : (
                <div className="fade-in" key={tab}>
                  {/* Common Fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name *</label>
                      <input className="swift-input" placeholder="Rahul Sharma" value={form.name} onChange={set("name")} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone Number *</label>
                      <input className="swift-input" placeholder="+91 98765 43210" value={form.phone} onChange={set("phone")} type="tel" />
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email Address *</label>
                    <input className="swift-input" placeholder="rahul@example.com" value={form.email} onChange={set("email")} type="email" />
                  </div>

                  {tab === "book" ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Moving From * <span style={{ color: "#9ca3af", fontWeight: 400 }}>(City)</span></label>
                          <input className="swift-input" placeholder="Kanpur" value={form.fromCity} onChange={set("fromCity")} />
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Moving To * <span style={{ color: "#9ca3af", fontWeight: 400 }}>(City)</span></label>
                          <input className="swift-input" placeholder="Delhi" value={form.toCity} onChange={set("toCity")} />
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 14 }}>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Move Date *</label>
                          <input className="swift-input" type="date" value={form.moveDate} onChange={set("moveDate")} min={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Move Type</label>
                          <select className="swift-input" value={form.moveType} onChange={set("moveType")}>
                            <option value="home">🏠 Home</option>
                            <option value="office">🏢 Office</option>
                            <option value="vehicle">🚗 Vehicle</option>
                            <option value="storage">📦 Storage</option>
                            <option value="international">🌐 International</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Property Size</label>
                          <select className="swift-input" value={form.propertySize} onChange={set("propertySize")}>
                            <option value="studio">Studio/Room</option>
                            <option value="1bhk">1 BHK</option>
                            <option value="2bhk">2 BHK</option>
                            <option value="3bhk">3 BHK</option>
                            <option value="4bhk">4 BHK+</option>
                            <option value="office">Office Space</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Additional Notes</label>
                        <textarea className="swift-input" rows={3} placeholder="Special items, fragile goods, preferred timing..." value={form.notes} onChange={set("notes")} style={{ resize: "vertical" }} />
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: 14 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Your Query *</label>
                      <textarea className="swift-input" rows={5} placeholder="Describe your query or requirement..." value={form.message} onChange={set("message")} style={{ resize: "vertical" }} />
                    </div>
                  )}

                  {/* Integration Status Banner */}
                  {configured < 3 && (
                    <div style={{ marginTop: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#92400e" }}>⚙️ {configured}/3 integrations configured — data may not reach you yet.</span>
                      <button onClick={() => setShowSetup(true)} style={{ background: "none", border: "none", color: "#ea580c", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>Setup →</button>
                    </div>
                  )}

                  <button className="swift-btn" style={{ marginTop: 20, width: "100%", justifyContent: "center", fontSize: 16 }} onClick={handleSubmit} disabled={status === "loading"}>
                    {status === "loading"
                      ? <><div className="spinner" /> Submitting...</>
                      : <><Send size={18} /> {tab === "book" ? "Submit Booking Request" : "Send Query"}</>}
                  </button>
                  <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 10, marginBottom: 0 }}>
                    By submitting you agree to be contacted by our team regarding your request.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick contact */}
          <div style={{ display: "flex", gap: 16, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[[Phone, CONFIG.company.phone, `tel:${CONFIG.company.phone}`],[Mail, CONFIG.company.email, `mailto:${CONFIG.company.email}`],[MessageSquare, "WhatsApp Us", `https://wa.me/${CONFIG.callmebot.adminPhone}`]].map(([Icon, label, href], i) => (
              <a key={i} href={href} style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#fb923c"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>
                <Icon size={15} />{label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 40, justifyContent: "space-between", flexWrap: "wrap", marginBottom: 32 }}>
            <div style={{ maxWidth: 280 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ background: "#ea580c", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Truck size={15} color="#fff" />
                </div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{CONFIG.company.name}</span>
              </div>
              <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: 0 }}>India's trusted packers & movers. Professional, insured, on-time — every time.</p>
            </div>
            <div>
              <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: "0 0 14px" }}>Contact</h4>
              {[[Phone, CONFIG.company.phone],[Mail, CONFIG.company.email],[MapPin, CONFIG.company.address]].map(([Icon, t], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <Icon size={14} color="#ea580c" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ color: "#475569", fontSize: 13 }}>© {new Date().getFullYear()} {CONFIG.company.fullName}. All rights reserved.</span>
            <button onClick={() => setShowSetup(true)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 14px", color: "#475569", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Settings size={12} /> Admin Setup
            </button>
          </div>
        </div>
      </footer>

      {showSetup && <SetupGuide onClose={() => setShowSetup(false)} />}
    </>
  );
}
