import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { Ticket } from '../types/ticket';
import { toast } from 'react-hot-toast';
import {
  LogOut, Phone, Mail, MapPin, Calendar,
  Clock, CheckCircle, XCircle, Users, Eye
} from 'lucide-react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .db-root {
    min-height: 100vh;
    background: #080b12;
    font-family: 'DM Mono', monospace;
    color: #fff;
  }

  /* ── GRID BG ── */
  .db-grid {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,210,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,210,255,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── HEADER ── */
  .db-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(8,11,18,0.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0,210,255,0.1);
  }
  .db-header-inner {
    max-width: 1400px; margin: 0 auto;
    padding: 0 2rem;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .db-brand {
    display: flex; align-items: center; gap: 12px;
  }
  .db-brand-icon {
    width: 32px; height: 32px;
    border: 1px solid rgba(0,210,255,0.4);
    border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .db-brand-icon::before {
    content: '';
    position: absolute; inset: 3px;
    background: rgba(0,210,255,0.15);
    border-radius: 1px;
  }
  .db-brand-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00d2ff;
    box-shadow: 0 0 8px #00d2ff;
    position: relative; z-index: 1;
    animation: blink 2s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .db-brand-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: -0.01em; }
  .db-brand-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px; }

  .db-header-right { display: flex; align-items: center; gap: 16px; }
  .db-live-badge {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }
  .db-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #00ff88; box-shadow: 0 0 6px #00ff88;
    animation: blink 1.5s ease-in-out infinite;
  }
  .btn-logout {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 14px;
    background: rgba(255,60,60,0.08);
    border: 1px solid rgba(255,60,60,0.2);
    border-radius: 2px;
    color: rgba(255,100,100,0.8);
    font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: 0.08em;
    cursor: pointer; transition: background 0.2s, border-color 0.2s;
  }
  .btn-logout:hover { background: rgba(255,60,60,0.15); border-color: rgba(255,60,60,0.4); }

  /* ── LAYOUT ── */
  .db-body { max-width: 1400px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1; }

  /* ── STATS ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px; margin-bottom: 2rem;
  }
  @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 640px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

  .stat-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 2px;
    padding: 1rem 1.1rem;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, background 0.2s;
  }
  .stat-card:hover { border-color: rgba(0,210,255,0.2); background: rgba(0,210,255,0.03); }
  .stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 2px;
  }
  .stat-card.c-total::after  { background: linear-gradient(90deg, transparent, rgba(0,210,255,0.5), transparent); }
  .stat-card.c-pending::after { background: linear-gradient(90deg, transparent, rgba(255,190,0,0.5), transparent); }
  .stat-card.c-contacted::after { background: linear-gradient(90deg, transparent, rgba(0,140,255,0.5), transparent); }
  .stat-card.c-scheduled::after { background: linear-gradient(90deg, transparent, rgba(160,80,255,0.5), transparent); }
  .stat-card.c-completed::after { background: linear-gradient(90deg, transparent, rgba(0,220,120,0.5), transparent); }
  .stat-card.c-cancelled::after { background: linear-gradient(90deg, transparent, rgba(255,60,60,0.5), transparent); }

  .stat-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 6px; }
  .stat-num { font-family: 'Syne', sans-serif; font-size: 1.75rem; font-weight: 800; line-height: 1; }
  .stat-num.cyan  { color: #00d2ff; }
  .stat-num.amber { color: #fbbf24; }
  .stat-num.blue  { color: #60a5fa; }
  .stat-num.purple{ color: #a78bfa; }
  .stat-num.green { color: #34d399; }
  .stat-num.red   { color: #f87171; }
  .stat-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0.15; }

  /* ── SECTION HEADER ── */
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4);
    display: flex; align-items: center; gap: 8px;
  }
  .section-title::before {
    content: ''; display: block; width: 12px; height: 1px; background: rgba(0,210,255,0.5);
  }

  /* ── FILTERS ── */
  .filters { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }
  .filter-btn {
    padding: 6px 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.08em;
    color: rgba(255,255,255,0.4);
    cursor: pointer; transition: all 0.15s;
  }
  .filter-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
  .filter-btn.active-all      { background: rgba(0,210,255,0.12); border-color: rgba(0,210,255,0.4); color: #00d2ff; }
  .filter-btn.active-pending  { background: rgba(251,191,36,0.1);  border-color: rgba(251,191,36,0.4);  color: #fbbf24; }
  .filter-btn.active-contacted{ background: rgba(96,165,250,0.1);  border-color: rgba(96,165,250,0.4);  color: #60a5fa; }
  .filter-btn.active-scheduled{ background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.4); color: #a78bfa; }
  .filter-btn.active-completed{ background: rgba(52,211,153,0.1);  border-color: rgba(52,211,153,0.4);  color: #34d399; }
  .filter-btn.active-cancelled{ background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.4); color: #f87171; }

  /* ── TABLE ── */
  .table-wrap {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }
  .table-wrap::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0,210,255,0.3), transparent);
  }
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl thead tr { border-bottom: 1px solid rgba(255,255,255,0.06); }
  .tbl th {
    padding: 12px 20px;
    text-align: left; font-size: 9px; font-weight: 500;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); font-family: 'DM Mono', monospace;
    background: rgba(0,0,0,0.2);
  }
  .tbl tbody tr {
    border-bottom: 1px solid rgba(255,255,255,0.04);
    cursor: pointer; transition: background 0.15s;
  }
  .tbl tbody tr:last-child { border-bottom: none; }
  .tbl tbody tr:hover { background: rgba(0,210,255,0.03); }
  .tbl td { padding: 14px 20px; vertical-align: middle; }

  .td-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 600; color: #fff; }
  .td-sub  { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 2px; letter-spacing: 0.03em; }
  .td-mono { font-size: 12px; color: rgba(255,255,255,0.7); }

  .status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px;
    border-radius: 2px; border: 1px solid;
    font-size: 9px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  }
  .status-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .sp-pending   { background: rgba(251,191,36,0.08);  color: #fbbf24; border-color: rgba(251,191,36,0.25); }
  .sp-contacted { background: rgba(96,165,250,0.08);  color: #60a5fa; border-color: rgba(96,165,250,0.25); }
  .sp-scheduled { background: rgba(167,139,250,0.08); color: #a78bfa; border-color: rgba(167,139,250,0.25); }
  .sp-completed { background: rgba(52,211,153,0.08);  color: #34d399; border-color: rgba(52,211,153,0.25); }
  .sp-cancelled { background: rgba(248,113,113,0.08); color: #f87171; border-color: rgba(248,113,113,0.25); }

  .btn-view {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px;
    background: rgba(0,210,255,0.07);
    border: 1px solid rgba(0,210,255,0.2);
    border-radius: 2px;
    color: #00d2ff; font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.06em;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-view:hover { background: rgba(0,210,255,0.15); border-color: rgba(0,210,255,0.4); }

  .loc-wrap { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.6); }

  /* ── EMPTY STATE ── */
  .empty-state {
    padding: 4rem 2rem; text-align: center;
    color: rgba(255,255,255,0.2); font-size: 12px; letter-spacing: 0.06em;
  }

  /* ── LOADING ── */
  .loading-screen {
    min-height: 100vh; background: #080b12;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 16px;
    font-family: 'DM Mono', monospace;
  }
  .loading-spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(0,210,255,0.1);
    border-top-color: #00d2ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.25); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal {
    background: #0d1117;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    max-width: 600px; width: 100%;
    max-height: 90vh; overflow-y: auto;
    position: relative;
    animation: slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #00d2ff, transparent);
  }
  .modal-corner-tr {
    position: absolute; top: -1px; right: -1px; width: 16px; height: 16px;
    border-top: 2px solid rgba(0,210,255,0.5); border-right: 2px solid rgba(0,210,255,0.5);
  }
  .modal-corner-bl {
    position: absolute; bottom: -1px; left: -1px; width: 16px; height: 16px;
    border-bottom: 2px solid rgba(0,210,255,0.2); border-left: 2px solid rgba(0,210,255,0.2);
  }

  .modal-head {
    position: sticky; top: 0;
    background: rgba(13,17,23,0.98);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    backdrop-filter: blur(8px);
  }
  .modal-title {
    font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800;
    letter-spacing: -0.01em;
  }
  .modal-id { font-size: 10px; color: rgba(0,210,255,0.5); letter-spacing: 0.1em; margin-top: 2px; }
  .btn-close {
    width: 28px; height: 28px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 2px; color: rgba(255,255,255,0.5);
    font-size: 14px; cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .btn-close:hover { background: rgba(255,60,60,0.15); border-color: rgba(255,60,60,0.3); color: #f87171; }

  .modal-body { padding: 1.5rem; }

  .info-section { margin-bottom: 1.5rem; }
  .info-section-title {
    font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(255,255,255,0.25); margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .info-section-title::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-cell {
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 2px; padding: 10px 12px;
  }
  .info-cell-label { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-bottom: 4px; }
  .info-cell-val { font-size: 13px; color: #fff; }

  .verified-badge {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9px; letter-spacing: 0.08em;
    color: #34d399; margin-top: 3px;
  }

  /* Status buttons */
  .status-btns { display: flex; flex-wrap: wrap; gap: 6px; }
  .status-btn {
    padding: 6px 14px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(255,255,255,0.35); cursor: pointer; transition: all 0.15s;
  }
  .status-btn:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.7); }
  .status-btn.active-pending   { background: rgba(251,191,36,0.12);  border-color: rgba(251,191,36,0.5);   color: #fbbf24; }
  .status-btn.active-contacted { background: rgba(96,165,250,0.12);  border-color: rgba(96,165,250,0.5);   color: #60a5fa; }
  .status-btn.active-scheduled { background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.5);  color: #a78bfa; }
  .status-btn.active-completed { background: rgba(52,211,153,0.12);  border-color: rgba(52,211,153,0.5);   color: #34d399; }
  .status-btn.active-cancelled { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.5);  color: #f87171; }

  /* Action buttons */
  .modal-actions { display: flex; gap: 10px; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); }
  .action-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px; border-radius: 2px; border: none;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; transition: all 0.15s;
  }
  .action-btn.email { background: rgba(0,210,255,0.12); border: 1px solid rgba(0,210,255,0.25); color: #00d2ff; }
  .action-btn.email:hover { background: rgba(0,210,255,0.2); }
  .action-btn.call { background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25); color: #34d399; }
  .action-btn.call:hover { background: rgba(52,211,153,0.18); }
`;

function StatusPill({ status }: { status: string }) {
  return <span className={`status-pill sp-${status}`}>{status}</span>;
}

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [stats, setStats] = useState({ total:0, pending:0, contacted:0, scheduled:0, completed:0, cancelled:0 });

  useEffect(() => {
    const q = query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Ticket[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Ticket));
      setTickets(data);
      setStats({
        total: data.length,
        pending:   data.filter(t => t.status === 'pending').length,
        contacted: data.filter(t => t.status === 'contacted').length,
        scheduled: data.filter(t => t.status === 'scheduled').length,
        completed: data.filter(t => t.status === 'completed').length,
        cancelled: data.filter(t => t.status === 'cancelled').length,
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: Ticket['status']) => {
    try {
      await updateDoc(doc(db, 'tickets', id), { status: newStatus });
      if (selectedTicket?.id === id) setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : prev);
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleLogout = async () => {
    try { await signOut(auth); toast.success('Logged out'); window.location.reload(); }
    catch { toast.error('Failed to logout'); }
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  if (loading) return (
    <div className="loading-screen">
      <style>{STYLES}</style>
      <div className="loading-spinner" />
      <p className="loading-text">Loading console...</p>
    </div>
  );

  return (
    <div className="db-root">
      <style>{STYLES}</style>
      <div className="db-grid" />

      {/* Header */}
      <header className="db-header">
        <div className="db-header-inner">
          <div className="db-brand">
            <div className="db-brand-icon"><div className="db-brand-dot" /></div>
            <div>
              <div className="db-brand-text">Optilink</div>
              <div className="db-brand-sub">Admin Console</div>
            </div>
          </div>
          <div className="db-header-right">
            <span className="db-live-badge">
              <span className="db-live-dot" /> Live
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="db-body">

        {/* Stats */}
        <div className="stats-grid">
          {[
            { key: 'total',     label: 'Total',     val: stats.total,     cls: 'c-total cyan',    Icon: Users },
            { key: 'pending',   label: 'Pending',   val: stats.pending,   cls: 'c-pending amber', Icon: Clock },
            { key: 'contacted', label: 'Contacted', val: stats.contacted, cls: 'c-contacted blue', Icon: Phone },
            { key: 'scheduled', label: 'Scheduled', val: stats.scheduled, cls: 'c-scheduled purple', Icon: Calendar },
            { key: 'completed', label: 'Completed', val: stats.completed, cls: 'c-completed green', Icon: CheckCircle },
            { key: 'cancelled', label: 'Cancelled', val: stats.cancelled, cls: 'c-cancelled red',  Icon: XCircle },
          ].map(({ key, label, val, cls, Icon }) => (
            <div key={key} className={`stat-card ${cls.split(' ')[0]}`}>
              <div className="stat-label">{label}</div>
              <div className={`stat-num ${cls.split(' ')[1]}`}>{val}</div>
              <div className="stat-icon"><Icon size={28} /></div>
            </div>
          ))}
        </div>

        {/* Tickets */}
        <div className="section-header">
          <div className="section-title">Installation Tickets</div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="filters">
          {[
            { id: 'all',       label: `All  ·  ${stats.total}` },
            { id: 'pending',   label: `Pending  ·  ${stats.pending}` },
            { id: 'contacted', label: `Contacted  ·  ${stats.contacted}` },
            { id: 'scheduled', label: `Scheduled  ·  ${stats.scheduled}` },
            { id: 'completed', label: `Completed  ·  ${stats.completed}` },
            { id: 'cancelled', label: `Cancelled  ·  ${stats.cancelled}` },
          ].map(f => (
            <button
              key={f.id}
              className={`filter-btn ${filter === f.id ? `active-${f.id}` : ''}`}
              onClick={() => setFilter(f.id)}
            >{f.label}</button>
          ))}
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="empty-state">No tickets found</td></tr>
                ) : filtered.map(ticket => (
                  <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)}>
                    <td>
                      <div className="td-name">{ticket.fullName}</div>
                      <div className="td-sub">{ticket.googleDisplayName}</div>
                    </td>
                    <td>
                      <div className="td-mono">{ticket.phoneNumber}</div>
                      <div className="td-sub">{ticket.email}</div>
                    </td>
                    <td>
                      <div className="loc-wrap">
                        <MapPin size={11} style={{ opacity: 0.4 }} />
                        <span>{ticket.location}</span>
                      </div>
                    </td>
                    <td><StatusPill status={ticket.status} /></td>
                    <td>
                      <div className="td-mono">{ticket.createdAt?.toDate().toLocaleDateString()}</div>
                      <div className="td-sub">{ticket.createdAt?.toDate().toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <button className="btn-view" onClick={e => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-corner-tr" />
            <div className="modal-corner-bl" />

            <div className="modal-head">
              <div>
                <div className="modal-title">{selectedTicket.fullName}</div>
                <div className="modal-id">// TKT-{selectedTicket.id.slice(0,8).toUpperCase()}</div>
              </div>
              <button className="btn-close" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="info-section">
                <div className="info-section-title">Customer Information</div>
                <div className="info-grid">
                  {[
                    { label: 'Full Name',      val: selectedTicket.fullName },
                    { label: 'Google Account', val: selectedTicket.googleDisplayName },
                    { label: 'Phone',          val: selectedTicket.phoneNumber },
                    { label: 'Location',       val: selectedTicket.location },
                    { label: 'Submitted',      val: selectedTicket.createdAt?.toDate().toLocaleString() },
                  ].map(({ label, val }) => (
                    <div key={label} className="info-cell">
                      <div className="info-cell-label">{label}</div>
                      <div className="info-cell-val">{val}</div>
                    </div>
                  ))}
                  <div className="info-cell">
                    <div className="info-cell-label">Email</div>
                    <div className="info-cell-val">{selectedTicket.email}</div>
                    {selectedTicket.emailVerified && (
                      <div className="verified-badge"><CheckCircle size={10} /> Verified</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="info-section">
                <div className="info-section-title">Update Status</div>
                <div className="status-btns">
                  {(['pending','contacted','scheduled','completed','cancelled'] as Ticket['status'][]).map(s => (
                    <button
                      key={s}
                      className={`status-btn ${selectedTicket.status === s ? `active-${s}` : ''}`}
                      onClick={() => handleStatusUpdate(selectedTicket.id, s)}
                    >{s}</button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button className="action-btn email" onClick={() => window.location.href = `mailto:${selectedTicket.email}`}>
                  <Mail size={13} /> Email
                </button>
                <button className="action-btn call" onClick={() => window.location.href = `tel:${selectedTicket.phoneNumber}`}>
                  <Phone size={13} /> Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}