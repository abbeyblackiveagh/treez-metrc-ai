import { useState, useCallback } from "react";
import { STATES, fetchBulletinsForState, summarizeBulletin } from "./api.js";
import "./App.css";

const SEEN_KEY = "metrc_seen_bulletins";

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); }
  catch { return new Set(); }
}
function persistSeen(ids) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...ids])); }
  catch {}
}

const CATEGORY_META = {
  "system-update":  { bg: "#E6F1FB", color: "#0C447C", label: "System update" },
  "compliance":     { bg: "#FAEEDA", color: "#633806", label: "Compliance" },
  "new-feature":    { bg: "#EAF3DE", color: "#27500A", label: "New feature" },
  "policy-change":  { bg: "#FAECE7", color: "#4A1B0C", label: "Policy change" },
  "training":       { bg: "#EEEDFE", color: "#26215C", label: "Training" },
};

function Badge({ category }) {
  const m = CATEGORY_META[category] || { bg: "#F1EFE8", color: "#2C2C2A", label: category };
  return (
    <span className="badge" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

function BulletinCard({ bulletin, isNew, expanded, loadingExpand, onToggle }) {
  return (
    <div className={`bulletin-card ${isNew ? "bulletin-card--new" : ""}`}>
      {isNew && <span className="new-pill">NEW</span>}
      <div className="bulletin-header">
        <div className="bulletin-meta">
          <span className="bulletin-id">{bulletin.id}</span>
          {bulletin.detail?.category && <Badge category={bulletin.detail.category} />}
        </div>
        <h3 className="bulletin-title">{bulletin.title}</h3>
        {bulletin.date && <p className="bulletin-date">{bulletin.date}</p>}
      </div>

      {expanded && bulletin.detail && (
        <div className="bulletin-detail">
          <p className="bulletin-summary">{bulletin.detail.summary}</p>
          {bulletin.detail.keyPoints?.length > 0 && (
            <ul className="bulletin-points">
              {bulletin.detail.keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
          )}
          {bulletin.detail.effectiveDate && (
            <p className="bulletin-effective">Effective: {bulletin.detail.effectiveDate}</p>
          )}
          {bulletin.url && (
            <a href={bulletin.url} target="_blank" rel="noreferrer" className="bulletin-pdf-link">
              View original PDF →
            </a>
          )}
        </div>
      )}

      <button className="btn-outline" onClick={onToggle} disabled={loadingExpand}>
        {loadingExpand ? "Loading..." : expanded ? "Collapse" : "Summarize"}
      </button>
    </div>
  );
}

function exportCSV(bulletins, stateName) {
  const rows = [["ID", "Title", "Date", "Category", "Summary", "URL"]];
  bulletins.forEach(b => rows.push([
    b.id, b.title, b.date || "",
    b.detail?.category || "", b.detail?.summary || b.summary || "", b.url || ""
  ]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `metrc-${stateName.toLowerCase().replace(/ /g, "-")}.csv`;
  a.click();
}

export default function App() {
  const [selectedState, setSelectedState] = useState(null);
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [expandLoading, setExpandLoading] = useState(null);
  const [seenIds, setSeenIds] = useState(getSeenIds);
  const [search, setSearch] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  const loadState = useCallback(async (state) => {
    setSelectedState(state);
    setBulletins([]);
    setError(null);
    setLoading(true);
    setSearch("");
    setExpandedId(null);
    try {
      const data = await fetchBulletinsForState(state.slug, state.name);
      setBulletins(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  const handleExpand = async (bulletin) => {
    if (expandedId === bulletin.id) { setExpandedId(null); return; }
    if (bulletin.detail) { setExpandedId(bulletin.id); return; }
    setExpandLoading(bulletin.id);
    try {
      const detail = await summarizeBulletin(bulletin);
      setBulletins(prev => prev.map(b => b.id === bulletin.id ? { ...b, detail } : b));
      setExpandedId(bulletin.id);
    } catch {}
    setExpandLoading(null);
  };

  const markAllSeen = () => {
    const all = new Set([...seenIds, ...bulletins.map(b => b.id)]);
    setSeenIds(all);
    persistSeen(all);
  };

  const newCount = bulletins.filter(b => !seenIds.has(b.id)).length;
  const filtered = bulletins.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">M</div>
          <div>
            <p className="sidebar-title">Metrc Bulletins</p>
            <p className="sidebar-sub">Select a state</p>
          </div>
        </div>
        <nav className="state-list">
          {STATES.map(s => (
            <button
              key={s.code}
              className={`state-btn ${selectedState?.code === s.code ? "state-btn--active" : ""}`}
              onClick={() => loadState(s)}
            >
              <span className="state-code">{s.code}</span>
              <span className="state-name">{s.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        {!selectedState && (
          <div className="empty-state">
            <p className="empty-title">Select a state to get started</p>
            <p className="empty-sub">Official Metrc bulletins pulled live from metrc.com</p>
          </div>
        )}

        {selectedState && (
          <>
            <div className="main-header">
              <div>
                <h1 className="main-title">{selectedState.name}</h1>
                {lastChecked && <p className="main-sub">Fetched at {lastChecked}</p>}
              </div>
              <div className="main-actions">
                {newCount > 0 && (
                  <>
                    <span className="new-count">{newCount} new</span>
                    <button className="btn-outline" onClick={markAllSeen}>Mark seen</button>
                  </>
                )}
                {bulletins.length > 0 && (
                  <button className="btn-outline" onClick={() => exportCSV(bulletins, selectedState.name)}>
                    Export CSV
                  </button>
                )}
              </div>
            </div>

            {bulletins.length > 0 && (
              <input
                className="search-input"
                type="text"
                placeholder="Search by title or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            )}

            {loading && <p className="status-msg">Fetching bulletins from Metrc...</p>}
            {error && <p className="status-msg status-msg--error">Error: {error}</p>}

            {filtered.map(b => (
              <BulletinCard
                key={b.id}
                bulletin={b}
                isNew={!seenIds.has(b.id)}
                expanded={expandedId === b.id}
                loadingExpand={expandLoading === b.id}
                onToggle={() => handleExpand(b)}
              />
            ))}

            {!loading && bulletins.length > 0 && (
              <p className="footer-note">
                {filtered.length} bulletin{filtered.length !== 1 ? "s" : ""} · Sourced from metrc.com
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
