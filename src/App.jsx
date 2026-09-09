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

const seedOrders = [
  { id: 1, client: "Ahmed Traders", type: "Basmati", bags: 50, kg: 2500, amount: 250000, status: "Ready", date: "2026-08-30", step: 2, docs: { form: true, invoice: false, payment: false } },
  { id: 2, client: "Zafar & Sons", type: "Sella", bags: 120, kg: 6000, amount: 610000, status: "In Progress", date: "2026-08-29", step: 1, docs: { form: true, invoice: false, payment: false } },
  { id: 3, client: "Bilal Rice Traders", type: "Basmati", bags: 80, kg: 4000, amount: 340000, status: "Payment Due", date: "2026-08-25", step: 3, docs: { form: true, invoice: true, payment: false } },
  { id: 4, client: "Malik Grains Co.", type: "IRRI-6", bags: 200, kg: 10000, amount: 900000, status: "Ready", date: "2026-09-05", step: 5, docs: { form: true, invoice: true, payment: true } },
];

const seedStaff = [
  { id: 1, name: "Riaz Ahmed", role: "Machine Operator", wage: 25000, present: true },
  { id: 2, name: "Shakeel Khan", role: "Loader", wage: 18000, present: true },
  { id: 3, name: "Nasir Mehmood", role: "Accountant", wage: 30000, present: false },
];

const seedClients = [
  { id: 1, name: "Ahmed Traders", phone: "0300-1234567", note: "Prefers Basmati, pays on time.", total: 1400000 },
  { id: 2, name: "Zafar & Sons", phone: "0321-9988776", note: "Bulk buyer, mostly Sella.", total: 2100000 },
];

const seedDeliveries = [
  { id: 1, orderId: 4, client: "Malik Grains Co.", status: "En Route", bookedBy: "Malik Sahab (Owner)", driverName: "Imran Baig", driverPhone: "0345-1122334", date: "2026-09-07", time: "10:30 AM" },
  { id: 2, orderId: 1, client: "Ahmed Traders", status: "Booked", bookedBy: "Operator", driverName: "Waseem Akhtar", driverPhone: "0301-9988112", date: "2026-09-08", time: "2:00 PM" },
];

const tips = [
  { icon: "🌾", title: "Control paddy moisture before storage", text: "Storing paddy above 14% moisture increases breakage during milling. Check moisture before stocking large quantities." },
  { icon: "⚙️", title: "Schedule machine maintenance weekly", text: "A short weekly check on your husker and polisher can prevent costly breakdowns and downtime." },
  { icon: "💵", title: "Set clear payment terms with new clients", text: "Agreeing on payment days upfront (e.g. 15 days) reduces overdue payments later." },
  { icon: "📦", title: "Track broken rice percentage", text: "Rising broken % often points to paddy quality or a milling setting that needs adjusting." },
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

function Badge({ children, tone }) {
  const map = {
    green: { bg: COLORS.greenBg, color: COLORS.green },
    amber: { bg: COLORS.amberBg, color: COLORS.amber },
    red: { bg: COLORS.redBg, color: COLORS.red },
    blue: { bg: "#EAF3FD", color: COLORS.blueDeep },
    purple: { bg: "#F5F0FF", color: COLORS.purple },
  };
  const style = map[tone] || map.blue;
  return <span style={{ background: style.bg, color: style.color, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{children}</span>;
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

function TopBar({ title, onBack, onLogout, roleLabel }) {
  return (
    <div style={{ background: "#fff", borderBottom: `1px solid ${COLORS.line}`, padding: "16px 5vw", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {onBack && <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: "50%", background: "#EAF3FD", border: "none", fontSize: 18, cursor: "pointer", color: COLORS.blueDeep }}>←</button>}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {roleLabel && <Badge tone="purple">{roleLabel}</Badge>}
        {onLogout && <button onClick={onLogout} style={{ fontSize: 13, color: COLORS.blueDeep, background: "#EAF3FD", border: "none", padding: "8px 16px", borderRadius: 999, cursor: "pointer", fontWeight: 600 }}>Log Out</button>}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Temporary demo credentials until Supabase real accounts are connected (Step 6).
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
      <div style={{ background: "#fff", borderRadius: 20, padding: "44px 36px", width: "100%", maxWidth: 400, textAlign: "center", boxShadow: "0 20px 50px rgba(20,20,60,0.25)" }}>
        <div style={{ width: 64, height: 64, background: "#EAF3FD", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 30 }}>🌾</div>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Rice Mill Login</h2>
        <div style={{ color: COLORS.muted, fontSize: 14, marginBottom: 24 }}>Enter the details we gave you</div>
        <div style={{ textAlign: "left", marginBottom: 14 }}>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="e.g. owner" style={{ width: "100%", padding: 14, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 16 }} />
        </div>
        <div style={{ textAlign: "left", marginBottom: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={{ width: "100%", padding: 14, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 16 }} />
        </div>
        {error && <div style={{ color: COLORS.red, fontSize: 13, textAlign: "left", marginBottom: 10 }}>{error}</div>}
        <PrimaryButton onClick={handleLogin} style={{ width: "100%", padding: 15, fontSize: 16, marginTop: 8 }}>Log In</PrimaryButton>
        <div style={{ marginTop: 20, fontSize: 13, color: COLORS.muted }}>Forgot your password? Call support: 0300-0000000</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 16, padding: "22px 5vw 40px" }}>
        {tiles.map(t => (
          <div key={t.key} onClick={() => onNavigate(t.key)} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 18, padding: "26px 16px", textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>{t.emoji}</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{t.title}</div>
          </div>
        ))}
      </div>
      <div onClick={() => onNavigate("assistant")} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", cursor: "pointer", boxShadow: "0 8px 20px rgba(106,47,199,0.35)" }}>💬</div>
    </div>
  );
}

function OrderDetailModal({ order, setOrders, orders, onClose }) {
  const advanceStep = () => {
    if (order.step >= ORDER_STEPS.length - 1) return;
    setOrders(orders.map(o => o.id === order.id ? { ...o, step: o.step + 1 } : o));
  };
  const toggleDoc = (key) => {
    setOrders(orders.map(o => o.id === order.id ? { ...o, docs: { ...o.docs, [key]: !o.docs[key] } } : o));
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,20,50,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px 26px", maxWidth: 440, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontSize: 18 }}>{order.client}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: COLORS.muted }}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>{order.bags} bags · {order.kg.toLocaleString()} kg · {order.type} · Rs {order.amount.toLocaleString()}</div>

        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Order Progress</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {ORDER_STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: i <= order.step ? COLORS.green : "#EEE", color: i <= order.step ? "#fff" : COLORS.muted,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
              }}>{i <= order.step ? "✓" : i + 1}</div>
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
      </div>
    </div>
  );
}

function OrdersScreen({ orders, setOrders, onBack, role }) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [detailOrder, setDetailOrder] = useState(null);
  const [form, setForm] = useState({ client: "", type: "Basmati", bags: "", kg: "", amount: "" });

  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);
  const statusTone = (s) => s === "Ready" ? "green" : s === "In Progress" ? "amber" : "red";

  const addOrder = () => {
    if (!form.client || !form.bags || !form.kg || !form.amount) return;
    setOrders([...orders, {
      id: Date.now(), client: form.client, type: form.type,
      bags: Number(form.bags), kg: Number(form.kg), amount: Number(form.amount),
      status: "In Progress", date: new Date().toISOString().slice(0, 10), step: 0,
      docs: { form: false, invoice: false, payment: false },
    }]);
    setForm({ client: "", type: "Basmati", bags: "", kg: "", amount: "" });
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,20,50,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "30px 26px", maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>New Order</h3>
            {[
              { label: "Client Name", key: "client", type: "text", placeholder: "e.g. Ahmed Traders" },
              { label: "Number of Bags", key: "bags", type: "number", placeholder: "e.g. 50" },
              { label: "Weight (kg)", key: "kg", type: "number", placeholder: "e.g. 2500" },
              { label: "Total Amount (Rs)", key: "amount", type: "number", placeholder: "e.g. 250000" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14, textAlign: "left" }}>
                <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: 13, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 15 }} />
              </div>
            ))}
            <div style={{ marginBottom: 14, textAlign: "left" }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>Rice Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: 13, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 15 }}>
                <option>Basmati</option><option>Sella</option><option>Broken</option><option>IRRI-6</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
              <button onClick={addOrder} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Save Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeliveriesScreen({ deliveries, setDeliveries, orders, userName, onBack }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ orderId: "", driverName: "", driverPhone: "", date: "", time: "" });

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
    const message = `📦 Delivery Update - ${d.client}\nStatus: ${d.status}\nDriver: ${d.driverName} (${d.driverPhone})\nScheduled: ${d.date} at ${d.time}\n\n- Malik Rice Mills`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const addDelivery = () => {
    const order = orders.find(o => o.id === Number(form.orderId));
    if (!order || !form.driverName || !form.driverPhone || !form.date) return;
    setDeliveries([...deliveries, {
      id: Date.now(), orderId: order.id, client: order.client, status: "Booked",
      bookedBy: userName, driverName: form.driverName, driverPhone: form.driverPhone,
      date: form.date, time: form.time || "TBD",
    }]);
    setForm({ orderId: "", driverName: "", driverPhone: "", date: "", time: "" });
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{d.client}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Booked by {d.bookedBy} · {d.date} {d.time}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>Driver: {d.driverName} ({d.driverPhone})</div>
              </div>
              <Badge tone={stageTone(d.status)}>{d.status}</Badge>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              {d.status !== "Delivered" && (
                <button onClick={() => advance(d.id)} style={{ background: "#EAF3FD", color: COLORS.blueDeep, border: "none", padding: "9px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  ➜ Mark "{DELIVERY_STAGES[DELIVERY_STAGES.indexOf(d.status) + 1]}"
                </button>
              )}
              <button onClick={() => shareOnWhatsApp(d)} style={{ background: COLORS.greenBg, color: COLORS.green, border: "none", padding: "9px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                📲 Share on WhatsApp
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,20,50,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "30px 26px", maxWidth: 400, width: "100%" }}>
            <h3 style={{ fontSize: 18, marginBottom: 20 }}>Book Delivery</h3>
            <div style={{ marginBottom: 14, textAlign: "left" }}>
              <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>Order</label>
              <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} style={{ width: "100%", padding: 13, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 15 }}>
                <option value="">Select an order</option>
                {orders.map(o => <option key={o.id} value={o.id}>{o.client} — {o.kg.toLocaleString()} kg</option>)}
              </select>
            </div>
            {[
              { label: "Driver Name", key: "driverName", type: "text", placeholder: "e.g. Imran Baig" },
              { label: "Driver Phone", key: "driverPhone", type: "text", placeholder: "e.g. 0345-1122334" },
              { label: "Delivery Date", key: "date", type: "date", placeholder: "" },
              { label: "Delivery Time", key: "time", type: "text", placeholder: "e.g. 2:00 PM" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14, textAlign: "left" }}>
                <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} style={{ width: "100%", padding: 13, border: `1.5px solid ${COLORS.line}`, borderRadius: 12, fontSize: 15 }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: "#F1F1F5", color: COLORS.ink }}>Cancel</button>
              <button onClick={addDelivery} style={{ flex: 1, padding: 13, borderRadius: 999, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", background: gradient, color: "#fff" }}>Book It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentsScreen({ orders, setOrders, onBack }) {
  const due = orders.filter(o => o.status === "Payment Due");
  const collected = orders.filter(o => o.status === "Ready").reduce((s, o) => s + o.amount, 0);
  const dueTotal = due.reduce((s, o) => s + o.amount, 0);
  const markPaid = (id) => setOrders(orders.map(o => o.id === id ? { ...o, status: "Ready" } : o));

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
      <div style={{ padding: "0 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {due.length === 0 && <Card style={{ textAlign: "center", color: COLORS.muted }}>Nothing overdue right now 🎉</Card>}
        {due.map(o => (
          <Card key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{o.client}</div>
              <div style={{ fontSize: 13, color: COLORS.muted }}>Order dated {o.date} · {daysAgo(o.date)} days ago</div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.red }}>Rs {o.amount.toLocaleString()}</div>
              <button onClick={() => markPaid(o.id)} style={{ background: COLORS.greenBg, color: COLORS.green, border: "none", padding: "8px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✓ Mark Paid</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StaffScreen({ staff, setStaff, onBack }) {
  const present = staff.filter(s => s.present).length;
  const salaryDue = staff.reduce((s, m) => s + m.wage, 0);
  const toggle = (id) => setStaff(staff.map(s => s.id === id ? { ...s, present: !s.present } : s));

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Staff & Payroll" onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, padding: "20px 5vw 8px" }}>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Present Today</div><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.green }}>{present} / {staff.length}</div></Card>
        <Card><div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Salary Due (this month)</div><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.amber }}>Rs {salaryDue.toLocaleString()}</div></Card>
      </div>
      <div style={{ padding: "20px 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {staff.map(s => (
          <Card key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EAF3FD", color: COLORS.blueDeep, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{s.name.split(" ").map(n => n[0]).join("")}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>{s.role} · Rs {s.wage.toLocaleString()}/mo</div>
              </div>
            </div>
            <button onClick={() => toggle(s.id)} style={{ padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", background: s.present ? COLORS.greenBg : COLORS.redBg, color: s.present ? COLORS.green : COLORS.red }}>{s.present ? "✓ Present" : "✕ Absent"}</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClientsScreen({ clients, orders, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Clients" onBack={onBack} />
      <div style={{ padding: "20px 5vw 90px", display: "flex", flexDirection: "column", gap: 12 }}>
        {clients.map(c => {
          const clientOrders = orders.filter(o => o.client === c.name).length;
          return (
            <Card key={c.id}>
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
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.line}`, fontSize: 13, color: COLORS.muted }}>📝 {c.note}</div>
            </Card>
          );
        })}
      </div>
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
      <div style={{ padding: "10px 5vw 6px", fontSize: 13, color: COLORS.muted }}>{inRange.length} order(s) in this period</div>
      <div style={{ padding: "20px 5vw 90px", textAlign: "center" }}>
        <PrimaryButton style={{ padding: "15px 30px", fontSize: 15 }}>⬇ Download as PDF</PrimaryButton>
      </div>
    </div>
  );
}

function TipsScreen({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }}>
      <TopBar title="Business Tips" onBack={onBack} />
      <div style={{ padding: "22px 5vw 90px", display: "flex", flexDirection: "column", gap: 14 }}>
        {tips.map((t, i) => (
          <Card key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "#F5F0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{t.title}</div>
              <div style={{ fontSize: 13.5, color: COLORS.muted }}>{t.text}</div>
            </div>
          </Card>
        ))}
      </div>
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
  // Calls our own backend (/api/ask), which safely holds the Anthropic API key
  // on the server. See api/ask.js and the setup note in the deployment guide.
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    throw new Error("Assistant backend not set up yet");
  }
  const data = await response.json();
  return data.reply || "";
}

function AssistantScreen({ orders, staff, deliveries, onBack }) {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Assalam-o-Alaikum! I'm your mill assistant. Ask me about orders, payments, staff or deliveries — or tap \"Get Alerts\" for a quick daily summary." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (customText) => {
    const text = customText || input.trim();
    if (!text || loading) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const context = buildDataContext(orders, staff, deliveries);
      const prompt = `You are a friendly, concise AI assistant inside a Rice Mill Management System, helping the mill owner track operations. Respond in ${language === "ur" ? "Urdu" : "English"}. Keep answers short and practical.\n\nCurrent mill data:\n${context}\n\nOwner's message: ${text}`;
      const reply = await callClaude(prompt);
      setMessages(m => [...m, { role: "assistant", text: reply || "Sorry, I couldn't get a response just now." }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: "Sorry, I couldn't reach the assistant right now — please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const getAlerts = async () => {
    setLoading(true);
    setMessages(m => [...m, { role: "user", text: "Get today's alerts" }]);
    try {
      const context = buildDataContext(orders, staff, deliveries);
      const prompt = `You are an AI assistant inside a Rice Mill Management System. Based on the data below, write a short daily alert summary (overdue payments, absent staff, deliveries needing attention). Write it TWICE: first a short section titled "English:" in English, then a section titled "اردو:" in Urdu, covering the same points.\n\nCurrent mill data:\n${context}`;
      const reply = await callClaude(prompt);
      setMessages(m => [...m, { role: "assistant", text: reply || "No alerts available right now." }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", text: "Sorry, couldn't generate alerts right now — please try again." }]);
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
        <button onClick={getAlerts} disabled={loading} style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, border: "none", background: COLORS.amberBg, color: COLORS.amber, cursor: loading ? "not-allowed" : "pointer" }}>🔔 Get Alerts</button>
      </div>

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
  const [clients] = useStorage("ricemill:clients", seedClients);
  const [deliveries, setDeliveries] = useStorage("ricemill:deliveries", seedDeliveries);

  const handleLogin = (r, name) => { setRole(r); setUserName(name); setLoggedIn(true); };

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;

  const goBack = () => setScreen("dashboard");
  const guard = (owner_only, target) => (role === "owner" || !owner_only) ? target : <DashboardScreen orders={orders} staff={staff} deliveries={deliveries} role={role} userName={userName} onNavigate={setScreen} onLogout={() => setLoggedIn(false)} />;

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: COLORS.ink }}>
      {screen === "dashboard" && <DashboardScreen orders={orders} staff={staff} deliveries={deliveries} role={role} userName={userName} onNavigate={setScreen} onLogout={() => setLoggedIn(false)} />}
      {screen === "orders" && <OrdersScreen orders={orders} setOrders={setOrders} onBack={goBack} role={role} />}
      {screen === "deliveries" && <DeliveriesScreen deliveries={deliveries} setDeliveries={setDeliveries} orders={orders} userName={userName} onBack={goBack} />}
      {screen === "payments" && guard(true, <PaymentsScreen orders={orders} setOrders={setOrders} onBack={goBack} />)}
      {screen === "staff" && guard(true, <StaffScreen staff={staff} setStaff={setStaff} onBack={goBack} />)}
      {screen === "clients" && <ClientsScreen clients={clients} orders={orders} onBack={goBack} />}
      {screen === "reports" && guard(true, <ReportsScreen orders={orders} onBack={goBack} />)}
      {screen === "tips" && <TipsScreen onBack={goBack} />}
      {screen === "assistant" && guard(true, <AssistantScreen orders={orders} staff={staff} deliveries={deliveries} onBack={goBack} />)}
    </div>
  );
}
