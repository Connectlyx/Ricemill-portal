import React, { useState, useEffect, useRef } from "react";

const COLORS = {
  blueLight: "#22A6E8",
  blueDeep: "#1B3A8A",
  purple: "#6A2FC7",
  ink: "#16213E",
  muted: "#5c6377",
  line: "#E7E9F2",
  bg: "#F6F7FB",
  green: "#1E9E5A",
  greenBg: "#E6F7ED",
  amber: "#E0A400",
  amberBg: "#FFF6DE",
  red: "#D64545",
  redBg: "#FDEAEA",
};
const gradient = `linear-gradient(120deg, ${COLORS.blueLight}, ${COLORS.purple})`;
const ORDER_STEPS = ["Order Placed", "Processing", "Ready", "Invoice Sent", "Payment Confirmed", "Delivered"];
const TODAY = new Date("2026-09-08");
const SUPPORT_NUMBER = "923368814666";

const defaultRiceTypes = ["Basmati", "Sella", "Broken", "IRRI-6"];

const seedOrders = [
  { id: 1, client: "Ahmed Traders", type: "Basmati", bags: 50, kg: 2500, amount: 250000, status: "Ready", date: "2026-08-30", step: 2, docs: { form: true, invoice: false, payment: false } },
  { id: 2, client: "Zafar & Sons", type: "Sella", bags: 120, kg: 6000, amount: 610000, status: "In Progress", date: "2026-08-29", step: 1, docs: { form: true, invoice: false, payment: false } },
  { id: 3, client: "Bilal Rice Traders", type: "Basmati", bags: 80, kg: 4000, amount: 340000, status: "Payment Due", date: "2026-08-25", step: 3, docs: { form: true, invoice: true, payment: false } },
  { id: 4, client: "Malik Grains Co.", type: "IRRI-6", bags: 200, kg: 10000, amount: 900000, status: "Ready", date: "2026-09-05", step: 5, docs: { form: true, invoice: true, payment: true } },
];

const seedStaff = [
  { id: 1, name: "Riaz Ahmed", role: "Machine Operator", wage: 25000, present: true, phone: "0301-2233445", joined: "2024-03-01", advance: 0 },
  { id: 2, name: "Shakeel Khan", role: "Loader", wage: 18000, present: true, phone: "0302-3344556", joined: "2024-06-15", advance: 5000 },
  { id: 3, name: "Nasir Mehmood", role: "Accountant", wage: 30000, present: false, phone: "0303-4455667", joined: "2023-11-10", advance: 0 },
];

const seedClients = [
  { id: 1, name: "Ahmed Traders", phone: "923001234567", address: "Main Bazaar, Sheikhupura", note: "Prefers Basmati, pays on time.", total: 1400000 },
  { id: 2, name: "Zafar & Sons", phone: "923219988776", address: "Grain Market, Gujranwala", note: "Bulk buyer, mostly Sella.", total: 2100000 },
];

const seedDeliveries = [
  { id: 1, orderId: 4, client: "Malik Grains Co.", status: "En Route", bookedBy: "Malik Sahab (Owner)", driverName: "Imran Baig", driverPhone: "0345-1122334", date: "2026-09-07", time: "10:30 AM", address: "Grain Market, Lahore", notes: "Client wants a call 30 mins before arrival." },
  { id: 2, orderId: 1, client: "Ahmed Traders", status: "Booked", bookedBy: "Operator", driverName: "Waseem Akhtar", driverPhone: "0301-9988112", date: "2026-09-08", time: "2:00 PM", address: "Main Bazaar, Sheikhupura", notes: "" },
];

const seedTips = [
  { icon: "🌾", title: "Control paddy moisture before storage", text: "Storing paddy above 14% moisture increases breakage during milling. Check moisture before stocking large quantities.", date: "2026-09-01" },
  { icon: "⚙️", title: "Schedule machine maintenance weekly", text: "A short weekly check on your husker and polisher can prevent costly breakdowns and downtime.", date: "2026-09-02" },
  { icon: "💵", title: "Set clear payment terms with new clients", text: "Agreeing on payment days upfront (e.g. 15 days) reduces overdue payments later.", date: "2026-09-03" },
  { icon: "📦", title: "Track broken rice percentage", text: "Rising broken % often points to paddy quality or a milling setting that needs adjusting.", date: "2026-09-04" },
];

const DELIVERY_STAGES = ["Booked", "Dispatched", "En Route", "Delivered"];

// NOTE: this uses the browser's localStorage as a simple, free way to save data
// on this device. Step 6 (Supabase) will upgrade this to a shared online database
// so every device/login sees the same live data instead of per-device only.
function useStorage(key, seed) {
  const [data, setData] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : seed;
    } catch (e) {
      return seed;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // storage unavailable, skip silently
    }
  }, [data, key]);
  return [data, setData];
}

function daysAgo(dateStr) {
  const d = new Date(dateStr);
  return Math.round((TODAY - d) / (1000 * 60 * 60 * 24));
}

function waLink(phone, text) {
  const clean = (phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

function Badge({ children, tone }) {
  const map = {
    green: { bg: COLORS.greenBg, color: COLORS.green },
    amber: { bg: COLORS.amberBg, color: COLORS.amber },
    red: { bg: COLORS.redBg, color: COLORS.red },
    blue: { bg: "#EAF3FD", color: COLORS.blueDeep },
    purple: { bg: "#F5F0FF", color: COLORS.purple },
  };
  const style = map[tone] || map.blue;
  return <span style={{ background: style.bg, color: style.color, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;
}

function Card({ children, style, onClick }) {
  return <div onClick={onClick} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 20, cursor: onClick ? "pointer" : "default", ...style }}>{children}</div>;
}

function PrimaryButton({ children, onClick, style, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#c9c9d6" : gradient, color: "#fff", border: "none", padding: "12px 22px",
      borderRadius: 999, fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", ...style,
    }}>{children}</button>
  );
}

function GhostButton({ children, onClick, style, tone }) {
  const map = {
    blue: { bg: "#EAF3FD", color: COLORS.blueDeep },
    green: { bg: COLORS.greenBg, color: COLORS.green },
    amber: { bg: COLORS.amberBg, color: COLORS.amber },
  };
  const c = map[tone] || map.blue;
  return (
    <button onClick={onClick} style={{ background: c.bg, color: c.color, border: "none", padding: "9px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

function Modal({ children, onClose, maxWidth }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,20,50,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 30 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: "28px 26px", maxWidth: maxWidth || 440, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14, textAlign: "left" }}>
      <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
const inputStyle = { width: "100%", padding: 13, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 15, fontFamily: "Inter, sans-serif" };

function TopBar({ title, onBack, onLogout, roleLabel }) {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${COLORS.line}`, padding: "14px 5vw", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onBack && <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", background: "#EAF3FD", border: "none", fontSize: 17, cursor: "pointer", color: COLORS.blueDeep, flexShrink: 0 }}>←</button>}
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {roleLabel && <Badge tone="purple">{roleLabel}</Badge>}
        <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.muted, letterSpacing: 0.3 }}>Powered by Connectlyx</span>
        {onLogout && <button onClick={onLogout} style={{ fontSize: 13, color: COLORS.blueDeep, background: "#EAF3FD", border: "none", padding: "8px 16px", borderRadius: 999, cursor: "pointer", fontWeight: 600 }}>Log Out</button>}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ACCOUNTS = {
    "owner": { password: "owner123", role: "owner", name: "Malik Sahab (Owner)" },
    "operator": { password: "operator123", role: "operator", name: "Operator" },
  };

  const handleLogin = () => {
    const account = ACCOUNTS[username.trim().toLowerCase()];
    if (!account || account.password !== password) {
      setError("Incorrect username or password.");
      return;
    }
    setError("");
    onLogin(account.role, account.name);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: gradient, padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 32px", width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 20px 50px rgba(20,20,60,0.25)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.purple, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 18 }}>Powered by Connectlyx</div>
        <div style={{ width: 60, height: 60, background: "#EAF3FD", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🌾</div>
        <h2 style={{ fontSize: 21, marginBottom: 6 }}>Rice Mill Login</h2>
        <div style={{ color: COLORS.muted, fontSize: 13.5, marginBottom: 26 }}>Enter the details we gave you</div>

        <Field label="Username">
          <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="e.g. owner" style={inputStyle} />
        </Field>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6, textAlign: "left" }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={inputStyle} />
        </div>
        {error && <div style={{ color: COLORS.red, fontSize: 13, textAlign: "left", marginTop: 8 }}>{error}</div>}

        <PrimaryButton onClick={handleLogin} style={{ width: "100%", padding: 15, fontSize: 16, marginTop: 16 }}>Log In</PrimaryButton>

        <div onClick={() => window.open(waLink(SUPPORT_NUMBER, "Hi, I forgot my password for the Rice Mill Portal, please help me reset it."), "_blank")}
          style={{ marginTop: 18, fontSize: 13, color: COLORS.blueDeep, cursor: "pointer", fontWeight: 600 }}>
          Forgot your password? Tap here
        </div>
        <div onClick={() => window.open(waLink(SUPPORT_NUMBER, "Hi, I need help with the Rice Mill Portal."), "_blank")}
          style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 999, background: COLORS.greenBg, color: COLORS.green, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          💬 WhatsApp / Call Support: +92 336 8814666
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ orders, staff, deliveries, role, userName, onNavigate, onLogout }) {
  const paymentsDue = orders.filter(o => o.status === "Payment Due").reduce((s, o) => s + o.amount, 0);
  const overdueClients = orders.filter(o => o.status === "Payment Due").length;
  const presentCount = staff.filter(s => s.present).length;
  const activeDeliveries = deliveries.filter(d => d.status !== "Delivered").length;

  const ownerTiles = [
    { key: "orders", emoji: "📦", title: "Orders" },
    { key: "deliveries", emoji: "🚚", title: "Deliveries" },
    { key: "staff", emoji: "👷", title: "Staff & Payroll" },
    { key: "clients", emoji: "🤝", title: "Clients" },
    { key: "payments", emoji: "💰", title: "Payments" },
    { key: "reports", emoji: "📊", title: "Reports" },
    { key: "tips", emoji: "💡", title: "Business Tips" },
    { key: "assistant", emoji: "🤖", title: "AI Assistant" },
  ];
  const operatorTiles = [
    { key: "orders", emoji: "📦", title: "Orders" },
    { key: "deliveries", emoji: "🚚", title: "Deliveries" },
    { key: "clients", emoji: "🤝", title: "Clients" },
    { key: "tips", emoji: "💡", title: "Business Tips" },
  ];
  const tiles = role === "owner" ? ownerTiles : operatorTiles;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Malik Rice Mills" onLogout={onLogout} roleLabel={role === "owner" ? "Owner Account" : "Operator Account"} />
      <div style={{ padding: "26px 5vw 6px", fontSize: 20, fontWeight: 700 }}>
        Assalam-o-Alaikum, {userName}
        <div style={{ fontSize: 14, color: COLORS.muted, fontWeight: 400 }}>Today's overview</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, padding: "18px 5vw 8px" }}>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Total Orders</div><div style={{ fontSize: 26, fontWeight: 700, color: COLORS.green }}>{orders.length}</div></Card>
        {role === "owner" && <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Payments Due</div><div style={{ fontSize: 26, fontWeight: 700, color: COLORS.amber }}>Rs {paymentsDue.toLocaleString()}</div></Card>}
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Active Deliveries</div><div style={{ fontSize: 26, fontWeight: 700, color: COLORS.blueDeep }}>{activeDeliveries}</div></Card>
        {role === "owner" && <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Staff Present Today</div><div style={{ fontSize: 26, fontWeight: 700, color: COLORS.green }}>{presentCount} / {staff.length}</div></Card>}
        {role === "owner" && <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Overdue Clients</div><div style={{ fontSize: 26, fontWeight: 700, color: COLORS.red }}>{overdueClients}</div></Card>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 16, padding: "22px 5vw 30px" }}>
        {tiles.map(t => (
          <div key={t.key} onClick={() => onNavigate(t.key)} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 18, padding: "26px 16px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>{t.emoji}</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", padding: "0 5vw 90px", fontSize: 12, color: COLORS.muted }}>Powered by Connectlyx</div>
      <div onClick={() => onNavigate("assistant")} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", cursor: "pointer", boxShadow: "0 8px 20px rgba(106,47,199,0.35)" }}>🤖</div>
    </div>
  );
}

function OrderDetailModal({ order, setOrders, orders, onClose }) {
  const advanceStep = () => {
    if (order.step >= ORDER_STEPS.length - 1) return;
    setOrders(orders.map(o => o.id === order.id ? { ...o, step: o.step + 1 } : o));
  };
  const toggleDoc = (key) => setOrders(orders.map(o => o.id === order.id ? { ...o, docs: { ...o.docs, [key]: !o.docs[key] } } : o));

  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <h3 style={{ fontSize: 18 }}>{order.client}</h3>
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
      </div>
      <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>{order.bags} bags · {order.kg.toLocaleString()} kg · {order.type} · Rs {order.amount.toLocaleString()} · Ordered {order.date}</div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Order Progress</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {ORDER_STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: i <= order.step ? COLORS.green : "#EEE", color: i <= order.step ? "#fff" : COLORS.muted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i <= order.step ? "✓" : i + 1}</div>
            <div style={{ fontSize: 14, color: i <= order.step ? COLORS.ink : COLORS.muted, fontWeight: i === order.step ? 700 : 400 }}>{s}</div>
          </div>
        ))}
      </div>
      <PrimaryButton onClick={advanceStep} disabled={order.step >= ORDER_STEPS.length - 1} style={{ width: "100%", marginBottom: 22 }}>
        {order.step >= ORDER_STEPS.length - 1 ? "Order Complete" : `Mark "${ORDER_STEPS[order.step + 1]}"`}
      </PrimaryButton>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Documents</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[["form", "Order Form Uploaded"], ["invoice", "Invoice Shared with Client"], ["payment", "Payment Confirmation Received"]].map(([key, label]) => (
          <div key={key} onClick={() => toggleDoc(key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${COLORS.line}`, cursor: "pointer" }}>
            <span style={{ fontSize: 14 }}>{label}</span>
            <Badge tone={order.docs[key] ? "green" : "amber"}>{order.docs[key] ? "✓ Done" : "Pending"}</Badge>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>Tip: payment confirmation can auto-verify once we connect your bank/JazzCash statement — optional add-on later.</div>
    </Modal>
  );
}

function OrdersScreen({ orders, setOrders, riceTypes, setRiceTypes, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [detailOrder, setDetailOrder] = useState(null);
  const [newType, setNewType] = useState("");
  const [form, setForm] = useState({ client: "", type: riceTypes[0], bags: "", kg: "", amount: "" });

  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);
  const statusTone = (s) => s === "Ready" ? "green" : s === "In Progress" ? "amber" : "red";

  const addRiceType = () => {
    const t = newType.trim();
    if (!t || riceTypes.includes(t)) return;
    setRiceTypes([...riceTypes, t]);
    setForm({ ...form, type: t });
    setNewType("");
  };

  const addOrder = () => {
    if (!form.client || !form.bags || !form.kg || !form.amount) return;
    setOrders([...orders, {
      id: Date.now(), client: form.client, type: form.type,
      bags: Number(form.bags), kg: Number(form.kg), amount: Number(form.amount),
      status: "In Progress", date: new Date().toISOString().slice(0, 10), step: 0,
      docs: { form: false, invoice: false, payment: false },
    }]);
    setForm({ client: "", type: riceTypes[0], bags: "", kg: "", amount: "" });
    setShowModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Orders" onBack={onBack} />
      <div style={{ padding: "20px 5vw 0", display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={() => setShowModal(true)}>+ New Order</PrimaryButton>
      </div>
      <div style={{ padding: "16px 5vw 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["All", "In Progress", "Ready", "Payment Due"].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{ padding: "9px 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${filter === f ? COLORS.blueDeep : COLORS.line}`, background: filter === f ? COLORS.blueDeep : "#fff", color: filter === f ? "#fff" : COLORS.muted }}>{f}</div>
        ))}
      </div>
      <div style={{ padding: "20px 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length === 0 && <Card style={{ textAlign: "center", color: COLORS.muted }}>No orders in this category yet.</Card>}
        {filtered.map(o => (
          <Card key={o.id} onClick={() => setDetailOrder(o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{o.client}</div>
              <div style={{ fontSize: 13, color: COLORS.muted }}>{o.bags} bags · {o.kg.toLocaleString()} kg · {o.type} · {o.date}</div>
              <div style={{ fontSize: 12, color: COLORS.blueDeep, marginTop: 4 }}>Step {o.step + 1}/{ORDER_STEPS.length}: {ORDER_STEPS[o.step]}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Rs {o.amount.toLocaleString()}</div>
              <Badge tone={statusTone(o.status)}>{o.status}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {detailOrder && <OrderDetailModal order={orders.find(o => o.id === detailOrder.id) || detailOrder} orders={orders} setOrders={setOrders} onClose={() => setDetailOrder(null)} />}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>New Order</h3>
          <Field label="Client Name"><input placeholder="e.g. Ahmed Traders" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} style={inputStyle} /></Field>
          <Field label="Number of Bags"><input type="number" placeholder="e.g. 50" value={form.bags} onChange={(e) => setForm({ ...form, bags: e.target.value })} style={inputStyle} /></Field>
          <Field label="Weight (kg)"><input type="number" placeholder="e.g. 2500" value={form.kg} onChange={(e) => setForm({ ...form, kg: e.target.value })} style={inputStyle} /></Field>
          <Field label="Total Amount (Rs)"><input type="number" placeholder="e.g. 250000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} /></Field>
          <Field label="Rice Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
              {riceTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input placeholder="Add a new rice type…" value={newType} onChange={(e) => setNewType(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addRiceType} style={{ padding: "0 18px", borderRadius: 12, border: "none", background: "#EAF3FD", color: COLORS.blueDeep, fontWeight: 700, cursor: "pointer" }}>+ Add</button>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
            <button onClick={addOrder} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Save Order</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DeliveryDetailModal({ delivery, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18 }}>{delivery.client}</h3>
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
      </div>
      {[
        ["Status", delivery.status],
        ["Booked By", delivery.bookedBy],
        ["Scheduled", `${delivery.date} at ${delivery.time}`],
        ["Driver", `${delivery.driverName} (${delivery.driverPhone})`],
        ["Delivery Address", delivery.address || "Not specified"],
        ["Notes", delivery.notes || "—"],
      ].map(([label, value]) => (
        <div key={label} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
        </div>
      ))}
    </Modal>
  );
}

function DeliveriesScreen({ deliveries, setDeliveries, orders, userName, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ orderId: "", driverName: "", driverPhone: "", date: "", time: "", address: "", notes: "" });

  const stageTone = (s) => s === "Delivered" ? "green" : s === "Booked" ? "blue" : "amber";

  const advance = (id) => {
    setDeliveries(deliveries.map(d => {
      if (d.id !== id) return d;
      const idx = DELIVERY_STAGES.indexOf(d.status);
      if (idx >= DELIVERY_STAGES.length - 1) return d;
      return { ...d, status: DELIVERY_STAGES[idx + 1] };
    }));
  };

  const shareOnWhatsApp = (d) => {
    const message = `📦 Delivery Update - ${d.client}\nStatus: ${d.status}\nDriver: ${d.driverName} (${d.driverPhone})\nScheduled: ${d.date} at ${d.time}\nAddress: ${d.address || "N/A"}\n\n- Malik Rice Mills`;
    window.open(waLink("", message), "_blank");
  };

  const addDelivery = () => {
    const order = orders.find(o => o.id === Number(form.orderId));
    if (!order || !form.driverName || !form.driverPhone || !form.date) return;
    setDeliveries([...deliveries, {
      id: Date.now(), orderId: order.id, client: order.client, status: "Booked",
      bookedBy: userName, driverName: form.driverName, driverPhone: form.driverPhone,
      date: form.date, time: form.time || "TBD", address: form.address, notes: form.notes,
    }]);
    setForm({ orderId: "", driverName: "", driverPhone: "", date: "", time: "", address: "", notes: "" });
    setShowModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Deliveries" onBack={onBack} />
      <div style={{ padding: "20px 5vw 0", display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={() => setShowModal(true)}>+ Book Delivery</PrimaryButton>
      </div>
      <div style={{ padding: "20px 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {deliveries.length === 0 && <Card style={{ textAlign: "center", color: COLORS.muted }}>No deliveries booked yet.</Card>}
        {deliveries.map(d => (
          <Card key={d.id}>
            <div onClick={() => setDetail(d)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{d.client}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Booked by {d.bookedBy} · {d.date} {d.time}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>Driver: {d.driverName} ({d.driverPhone})</div>
                {d.address && <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>📍 {d.address}</div>}
              </div>
              <Badge tone={stageTone(d.status)}>{d.status}</Badge>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {d.status !== "Delivered" && (
                <GhostButton tone="blue" onClick={() => advance(d.id)}>➜ Mark "{DELIVERY_STAGES[DELIVERY_STAGES.indexOf(d.status) + 1]}"</GhostButton>
              )}
              <GhostButton tone="green" onClick={() => shareOnWhatsApp(d)}>📲 Share on WhatsApp</GhostButton>
              <GhostButton tone="amber" onClick={() => setDetail(d)}>ℹ️ Full Details</GhostButton>
            </div>
          </Card>
        ))}
      </div>

      {detail && <DeliveryDetailModal delivery={detail} onClose={() => setDetail(null)} />}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Book Delivery</h3>
          <Field label="Order">
            <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} style={inputStyle}>
              <option value="">Select an order</option>
              {orders.map(o => <option key={o.id} value={o.id}>{o.client} — {o.kg.toLocaleString()} kg</option>)}
            </select>
          </Field>
          <Field label="Driver Name"><input placeholder="e.g. Imran Baig" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} style={inputStyle} /></Field>
          <Field label="Driver Phone"><input placeholder="e.g. 0345-1122334" value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} style={inputStyle} /></Field>
          <Field label="Delivery Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputStyle} /></Field>
          <Field label="Delivery Time"><input placeholder="e.g. 2:00 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={inputStyle} /></Field>
          <Field label="Delivery Address"><input placeholder="e.g. Grain Market, Lahore" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} /></Field>
          <Field label="Notes (optional)"><input placeholder="e.g. Call before arriving" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={inputStyle} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
            <button onClick={addDelivery} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Book It</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PaymentsScreen({ orders, setOrders, clients, onBack }) {
  const due = orders.filter(o => o.status === "Payment Due");
  const paid = orders.filter(o => o.status === "Ready");
  const collected = paid.reduce((s, o) => s + o.amount, 0);
  const dueTotal = due.reduce((s, o) => s + o.amount, 0);
  const markPaid = (id) => setOrders(orders.map(o => o.id === id ? { ...o, status: "Ready" } : o));

  const clientPhone = (name) => (clients.find(c => c.name === name) || {}).phone || SUPPORT_NUMBER;

  const sendReminder = (o) => {
    const msg = `Assalam-o-Alaikum ${o.client},\n\nThis is a reminder that your payment of Rs ${o.amount.toLocaleString()} for order dated ${o.date} is due.\nKindly clear it at your earliest convenience.\n\nThank you,\nMalik Rice Mills`;
    window.open(waLink(clientPhone(o.client), msg), "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Payments" onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, padding: "22px 5vw 8px" }}>
        <div style={{ borderRadius: 16, padding: 20, color: "#fff", background: "linear-gradient(120deg,#1E9E5A,#14743F)" }}>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>Collected</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Rs {collected.toLocaleString()}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 20, color: "#fff", background: "linear-gradient(120deg,#D64545,#A83232)" }}>
          <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>Payment Due</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Rs {dueTotal.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ padding: "26px 5vw 10px", fontWeight: 600, fontSize: 16 }}>Needs Attention</div>
      <div style={{ padding: "0 5vw 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {due.length === 0 && <Card style={{ textAlign: "center", color: COLORS.muted }}>Nothing overdue right now 🎉</Card>}
        {due.map(o => (
          <Card key={o.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{o.client}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Order dated {o.date} · {daysAgo(o.date)} days ago · {o.kg.toLocaleString()} kg {o.type}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.red }}>Rs {o.amount.toLocaleString()}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <GhostButton tone="green" onClick={() => sendReminder(o)}>📲 WhatsApp Reminder</GhostButton>
              <GhostButton tone="blue" onClick={() => markPaid(o.id)}>✓ Mark Paid</GhostButton>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ padding: "10px 5vw 10px", fontWeight: 600, fontSize: 16 }}>Payment History</div>
      <div style={{ padding: "0 5vw 90px", display: "flex", flexDirection: "column", gap: 10 }}>
        {paid.length === 0 && <Card style={{ textAlign: "center", color: COLORS.muted }}>No completed payments yet.</Card>}
        {paid.map(o => (
          <Card key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.client}</div>
              <div style={{ fontSize: 12, color: COLORS.muted }}>{o.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Rs {o.amount.toLocaleString()}</div>
              <Badge tone="green">✓ Paid</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StaffDetailModal({ member, setStaff, staff, onClose }) {
  const [advanceAmt, setAdvanceAmt] = useState("");
  const addAdvance = () => {
    const amt = Number(advanceAmt);
    if (!amt) return;
    setStaff(staff.map(s => s.id === member.id ? { ...s, advance: (s.advance || 0) + amt } : s));
    setAdvanceAmt("");
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18 }}>{member.name}</h3>
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
      </div>
      {[
        ["Role", member.role],
        ["Monthly Wage", `Rs ${member.wage.toLocaleString()}`],
        ["Phone", member.phone || "—"],
        ["Joined", member.joined || "—"],
        ["Attendance Today", member.present ? "Present" : "Absent"],
        ["Advance/Loan Balance", `Rs ${(member.advance || 0).toLocaleString()}`],
      ].map(([label, value]) => (
        <div key={label} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
        </div>
      ))}
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>Give Advance/Loan (Rs)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" placeholder="e.g. 5000" value={advanceAmt} onChange={(e) => setAdvanceAmt(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={addAdvance} style={{ padding: "0 18px", borderRadius: 12, border: "none", background: "#EAF3FD", color: COLORS.blueDeep, fontWeight: 700, cursor: "pointer" }}>Add</button>
        </div>
      </div>
    </Modal>
  );
}

function StaffScreen({ staff, setStaff, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", wage: "", phone: "" });

  const present = staff.filter(s => s.present).length;
  const salaryDue = staff.reduce((s, m) => s + m.wage, 0);
  const toggle = (id) => setStaff(staff.map(s => s.id === id ? { ...s, present: !s.present } : s));

  const addStaff = () => {
    if (!form.name || !form.role || !form.wage) return;
    setStaff([...staff, { id: Date.now(), name: form.name, role: form.role, wage: Number(form.wage), phone: form.phone, present: true, joined: new Date().toISOString().slice(0, 10), advance: 0 }]);
    setForm({ name: "", role: "", wage: "", phone: "" });
    setShowModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Staff & Payroll" onBack={onBack} />
      <div style={{ padding: "20px 5vw 0", display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={() => setShowModal(true)}>+ Add Staff</PrimaryButton>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, padding: "18px 5vw 8px" }}>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Present Today</div><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.green }}>{present} / {staff.length}</div></Card>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Salary Due (this month)</div><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.amber }}>Rs {salaryDue.toLocaleString()}</div></Card>
      </div>
      <div style={{ padding: "20px 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {staff.map(s => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div onClick={() => setDetail(s)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer", flex: 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EAF3FD", color: COLORS.blueDeep, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{s.name.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>{s.role} · Rs {s.wage.toLocaleString()}/mo</div>
                {s.advance > 0 && <div style={{ fontSize: 12, color: COLORS.amber, marginTop: 2 }}>Advance: Rs {s.advance.toLocaleString()}</div>}
              </div>
            </div>
            <button onClick={() => toggle(s.id)} style={{ padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: s.present ? COLORS.greenBg : COLORS.redBg, color: s.present ? COLORS.green : COLORS.red }}>{s.present ? "✓ Present" : "✕ Absent"}</button>
          </Card>
        ))}
      </div>

      {detail && <StaffDetailModal member={staff.find(s => s.id === detail.id) || detail} staff={staff} setStaff={setStaff} onClose={() => setDetail(null)} />}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Add Staff Member</h3>
          <Field label="Full Name"><input placeholder="e.g. Riaz Ahmed" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></Field>
          <Field label="Role"><input placeholder="e.g. Machine Operator" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle} /></Field>
          <Field label="Monthly Wage (Rs)"><input type="number" placeholder="e.g. 25000" value={form.wage} onChange={(e) => setForm({ ...form, wage: e.target.value })} style={inputStyle} /></Field>
          <Field label="Phone"><input placeholder="e.g. 0301-2233445" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
            <button onClick={addStaff} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ClientDetailModal({ client, orders, setClients, clients, onClose }) {
  const [note, setNote] = useState(client.note);
  const clientOrders = orders.filter(o => o.client === client.name);
  const saveNote = () => {
    setClients(clients.map(c => c.id === client.id ? { ...c, note } : c));
    onClose();
  };
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <h3 style={{ fontSize: 18 }}>{client.name}</h3>
        <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
      </div>
      <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 4 }}>📞 {client.phone}</div>
      <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>📍 {client.address || "No address on file"}</div>

      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Order History ({clientOrders.length})</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {clientOrders.length === 0 && <div style={{ fontSize: 13, color: COLORS.muted }}>No orders yet.</div>}
        {clientOrders.map(o => (
          <div key={o.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: COLORS.bg, borderRadius: 10, fontSize: 13 }}>
            <span>{o.date} · {o.type} · {o.kg.toLocaleString()} kg</span>
            <span style={{ fontWeight: 700 }}>Rs {o.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>Notes</label>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} />
      <PrimaryButton onClick={saveNote} style={{ width: "100%" }}>Save Note</PrimaryButton>
    </Modal>
  );
}

function ClientsScreen({ clients, setClients, orders, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });

  const addClient = () => {
    if (!form.name || !form.phone) return;
    setClients([...clients, { id: Date.now(), name: form.name, phone: form.phone.replace(/[^0-9]/g, ""), address: form.address, note: form.note, total: 0 }]);
    setForm({ name: "", phone: "", address: "", note: "" });
    setShowModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Clients" onBack={onBack} />
      <div style={{ padding: "20px 5vw 0", display: "flex", justifyContent: "flex-end" }}>
        <PrimaryButton onClick={() => setShowModal(true)}>+ Add Client</PrimaryButton>
      </div>
      <div style={{ padding: "20px 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {clients.map(c => {
          const clientOrders = orders.filter(o => o.client === c.name).length;
          return (
            <Card key={c.id} onClick={() => setDetail(c)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#F5F0FF", color: COLORS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.muted }}>{c.phone}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Rs {(c.total / 1000000).toFixed(1)}M</div>
                  <div style={{ fontSize: 12, color: COLORS.muted }}>{clientOrders} order(s) on file</div>
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.line}`, fontSize: 13, color: COLORS.muted }}>📝 {c.note || "No notes yet — tap to add."}</div>
            </Card>
          );
        })}
      </div>

      {detail && <ClientDetailModal client={clients.find(c => c.id === detail.id) || detail} clients={clients} setClients={setClients} orders={orders} onClose={() => setDetail(null)} />}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Add Client</h3>
          <Field label="Client / Business Name"><input placeholder="e.g. Ahmed Traders" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></Field>
          <Field label="WhatsApp Number"><input placeholder="e.g. 923001234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} /></Field>
          <Field label="Address"><input placeholder="e.g. Main Bazaar, City" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} /></Field>
          <Field label="Notes"><input placeholder="e.g. Prefers Basmati" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} style={inputStyle} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
            <button onClick={addClient} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ReportsScreen({ orders, onBack }) {
  const [period, setPeriod] = useState("Monthly");
  const ranges = { Daily: 1, Weekly: 7, Monthly: 30, "Half-Yearly": 182, Yearly: 365 };
  const inRange = orders.filter(o => daysAgo(o.date) <= ranges[period]);

  const totalKg = inRange.reduce((s, o) => s + o.kg, 0);
  const totalSales = inRange.reduce((s, o) => s + o.amount, 0);
  const collected = inRange.filter(o => o.status === "Ready").reduce((s, o) => s + o.amount, 0);
  const pending = totalSales - collected;

  const byType = {};
  inRange.forEach(o => { byType[o.type] = (byType[o.type] || 0) + o.kg; });

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Reports" onBack={onBack} />
      <div style={{ padding: "18px 5vw 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {Object.keys(ranges).map(p => (
          <div key={p} onClick={() => setPeriod(p)} style={{ padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${period === p ? COLORS.blueDeep : COLORS.line}`, background: period === p ? COLORS.blueDeep : "#fff", color: period === p ? "#fff" : COLORS.muted }}>{p}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, padding: "22px 5vw 8px" }}>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Total Weight Ordered</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.blueDeep }}>{totalKg.toLocaleString()} kg</div></Card>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Total Sales</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.blueDeep }}>Rs {totalSales.toLocaleString()}</div></Card>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Collected</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.green }}>Rs {collected.toLocaleString()}</div></Card>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 8 }}>Pending</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.amber }}>Rs {pending.toLocaleString()}</div></Card>
      </div>

      <div style={{ margin: "22px 5vw 0", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Weight by Rice Type</div>
        {Object.keys(byType).length === 0 && <div style={{ fontSize: 13, color: COLORS.muted }}>No orders in this period.</div>}
        {Object.entries(byType).map(([type, kg]) => (
          <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${COLORS.line}`, fontSize: 14 }}>
            <span>{type}</span><span style={{ fontWeight: 700 }}>{kg.toLocaleString()} kg</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 5vw 6px", fontSize: 13, color: COLORS.muted }}>{inRange.length} order(s) in this period</div>
      <div style={{ padding: "20px 5vw 90px", textAlign: "center" }}>
        <PrimaryButton onClick={() => window.print()} style={{ padding: "15px 30px", fontSize: 15 }}>⬇ Download as PDF</PrimaryButton>
        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>Uses your browser's "Save as PDF" print option.</div>
      </div>
    </div>
  );
}

function TipsScreen({ tips, setTips, role, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", text: "", icon: "💡" });

  const addTip = () => {
    if (!form.title || !form.text) return;
    setTips([{ ...form, date: new Date().toISOString().slice(0, 10) }, ...tips]);
    setForm({ title: "", text: "", icon: "💡" });
    setShowModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Business Tips" onBack={onBack} />
      {role === "owner" && (
        <div style={{ padding: "20px 5vw 0", display: "flex", justifyContent: "flex-end" }}>
          <PrimaryButton onClick={() => setShowModal(true)}>+ Add Tip</PrimaryButton>
        </div>
      )}
      <div style={{ padding: "22px 5vw 90px", display: "flex", flexDirection: "column", gap: 14 }}>
        {tips.map((t, i) => (
          <Card key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#F5F0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{t.title}</div>
              <div style={{ fontSize: 13.5, color: COLORS.muted, marginBottom: 6 }}>{t.text}</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>{t.date}</div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 style={{ fontSize: 18, marginBottom: 20 }}>Add Business Tip</h3>
          <Field label="Icon (emoji)"><input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={inputStyle} /></Field>
          <Field label="Title"><input placeholder="e.g. Reduce broken rice %" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} /></Field>
          <Field label="Details"><textarea rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
            <button onClick={addTip} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Publish</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function buildDataContext(orders, staff, deliveries) {
  const overdue = orders.filter(o => o.status === "Payment Due");
  const absent = staff.filter(s => !s.present);
  const activeDeliveries = deliveries.filter(d => d.status !== "Delivered");
  return [
    `Orders (${orders.length} total): ` + orders.map(o => `${o.client} - ${o.kg}kg ${o.type}, Rs ${o.amount}, status: ${o.status}, step: ${ORDER_STEPS[o.step]}`).join("; "),
    `Overdue payments: ` + (overdue.length ? overdue.map(o => `${o.client} owes Rs ${o.amount}`).join("; ") : "none"),
    `Staff absent today: ` + (absent.length ? absent.map(s => s.name).join(", ") : "none"),
    `Active deliveries: ` + (activeDeliveries.length ? activeDeliveries.map(d => `${d.client} - ${d.status}`).join("; ") : "none"),
  ].join("\n");
}

async function callClaude(prompt) {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Assistant backend not set up yet");
  }
  const data = await response.json();
  return data.reply || "";
}

function AssistantScreen({ orders, staff, deliveries, onBack }) {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Assalam-o-Alaikum! I'm your mill assistant. Checking today's important updates for you…" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorHint, setErrorHint] = useState(false);
  const endRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const getAlerts = async (isAuto) => {
    setLoading(true);
    if (!isAuto) setMessages(m => [...m, { role: "user", text: "Get today's alerts" }]);
    try {
      const context = buildDataContext(orders, staff, deliveries);
      const prompt = `You are an AI assistant inside a Rice Mill Management System, acting like a helpful human personal assistant to the owner. Based on the data below, proactively write a short daily alert summary (overdue payments, absent staff, deliveries needing attention). Only mention real issues found in the data — if nothing needs attention, say so briefly. Write it TWICE: first a short section titled "English:" in English, then a section titled "اردو:" in Urdu, covering the same points.\n\nCurrent mill data:\n${context}`;
      const reply = await callClaude(prompt);
      setMessages(m => [...m, { role: "assistant", text: reply || "No alerts available right now." }]);
      setErrorHint(false);
    } catch (e) {
      setErrorHint(true);
      setMessages(m => [...m, { role: "assistant", text: "I couldn't reach the assistant service just now." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    getAlerts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = async (customText) => {
    const text = customText || input.trim();
    if (!text || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const context = buildDataContext(orders, staff, deliveries);
      const prompt = `You are a friendly, concise AI assistant inside a Rice Mill Management System, acting like a helpful human personal assistant to the mill owner. Respond in ${language === "ur" ? "Urdu" : "English"}. Keep answers short and practical.\n\nCurrent mill data:\n${context}\n\nOwner's message: ${text}`;
      const reply = await callClaude(prompt);
      setMessages(m => [...m, { role: "assistant", text: reply || "Sorry, I couldn't get a response just now." }]);
      setErrorHint(false);
    } catch (e) {
      setErrorHint(true);
      setMessages(m => [...m, { role: "assistant", text: "Sorry, I couldn't reach the assistant right now — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column" }}>
      <TopBar title="AI Assistant" onBack={onBack} />
      <div style={{ padding: "14px 5vw 0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setLanguage("en")} style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1.5px solid ${language === "en" ? COLORS.blueDeep : COLORS.line}`, background: language === "en" ? COLORS.blueDeep : "#fff", color: language === "en" ? "#fff" : COLORS.muted, cursor: "pointer" }}>English</button>
        <button onClick={() => setLanguage("ur")} style={{ padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: `1.5px solid ${language === "ur" ? COLORS.blueDeep : COLORS.line}`, background: language === "ur" ? COLORS.blueDeep : "#fff", color: language === "ur" ? "#fff" : COLORS.muted, cursor: "pointer" }}>اردو</button>
        <button onClick={() => getAlerts(false)} disabled={loading} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: "none", background: COLORS.amberBg, color: COLORS.amber, cursor: loading ? "not-allowed" : "pointer" }}>🔔 Refresh Alerts</button>
      </div>

      {errorHint && (
        <div style={{ margin: "12px 5vw 0", padding: "10px 14px", background: COLORS.redBg, color: COLORS.red, borderRadius: 12, fontSize: 12.5 }}>
          Assistant isn't connected yet. In Vercel: Project Settings → Environment Variables → add <b>ANTHROPIC_API_KEY</b>, then redeploy.
        </div>
      )}

      <div style={{ flex: 1, padding: "16px 5vw", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
            <div style={{
              background: m.role === "user" ? gradient : "#fff", color: m.role === "user" ? "#fff" : COLORS.ink,
              border: m.role === "user" ? "none" : `1px solid ${COLORS.line}`, borderRadius: 16, padding: "12px 16px",
              fontSize: 14, whiteSpace: "pre-wrap",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 13, color: COLORS.muted }}>Thinking…</div>}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "14px 5vw 26px", display: "flex", gap: 10, background: "#fff", borderTop: `1px solid ${COLORS.line}` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about orders, payments, staff…" style={{ flex: 1, padding: 13, border: `1.5px solid ${COLORS.line}`, borderRadius: 999, fontSize: 14 }} />
        <PrimaryButton onClick={() => send()} disabled={loading} style={{ padding: "12px 20px" }}>Send</PrimaryButton>
      </div>
    </div>
  );
}

export default function RiceMillSystem() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("owner");
  const [userName, setUserName] = useState("Malik Sahab (Owner)");
  const [screen, setScreen] = useState("dashboard");
  const [orders, setOrders] = useStorage("ricemill:orders", seedOrders);
  const [staff, setStaff] = useStorage("ricemill:staff", seedStaff);
  const [clients, setClients] = useStorage("ricemill:clients", seedClients);
  const [deliveries, setDeliveries] = useStorage("ricemill:deliveries", seedDeliveries);
  const [riceTypes, setRiceTypes] = useStorage("ricemill:types", defaultRiceTypes);
  const [tips, setTips] = useStorage("ricemill:tips", seedTips);

  const handleLogin = (r, name) => { setRole(r); setUserName(name); setLoggedIn(true); };

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;

  const goBack = () => setScreen("dashboard");
  const guard = (owner_only, target) => (role === "owner" || !owner_only) ? target : <DashboardScreen orders={orders} staff={staff} deliveries={deliveries} role={role} userName={userName} onNavigate={setScreen} onLogout={() => setLoggedIn(false)} />;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: COLORS.ink }}>
      {screen === "dashboard" && <DashboardScreen orders={orders} staff={staff} deliveries={deliveries} role={role} userName={userName} onNavigate={setScreen} onLogout={() => setLoggedIn(false)} />}
      {screen === "orders" && <OrdersScreen orders={orders} setOrders={setOrders} riceTypes={riceTypes} setRiceTypes={setRiceTypes} onBack={goBack} />}
      {screen === "deliveries" && <DeliveriesScreen deliveries={deliveries} setDeliveries={setDeliveries} orders={orders} userName={userName} onBack={goBack} />}
      {screen === "payments" && guard(true, <PaymentsScreen orders={orders} setOrders={setOrders} clients={clients} onBack={goBack} />)}
      {screen === "staff" && guard(true, <StaffScreen staff={staff} setStaff={setStaff} onBack={goBack} />)}
      {screen === "clients" && <ClientsScreen clients={clients} setClients={setClients} orders={orders} onBack={goBack} />}
      {screen === "reports" && guard(true, <ReportsScreen orders={orders} onBack={goBack} />)}
      {screen === "tips" && <TipsScreen tips={tips} setTips={setTips} role={role} onBack={goBack} />}
      {screen === "assistant" && guard(true, <AssistantScreen orders={orders} staff={staff} deliveries={deliveries} onBack={goBack} />)}
    </div>
  );
}
