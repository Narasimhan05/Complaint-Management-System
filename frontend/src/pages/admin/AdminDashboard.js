import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import AssignModal from '../../components/admin/AssignModal';
import StatusUpdateModal from '../../components/admin/StatusUpdateModal';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const FILTERS = ['ALL','RAISED','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED'];
const SC = {
  RAISED:      { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', label:'Raised'      },
  IN_PROGRESS: { color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'In Progress' },
  ESCALATED:   { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'Escalated'   },
  RESOLVED:    { color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', label:'Resolved'    },
  CLOSED:      { color:'#64748b', bg:'#f8fafc', border:'#e2e8f0', label:'Closed'      },
};
const PC = {
  LOW:      { color:'#059669', bg:'#ecfdf5', border:'#a7f3d0' },
  MEDIUM:   { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  HIGH:     { color:'#ea580c', bg:'#fff7ed', border:'#fed7aa' },
  CRITICAL: { color:'#dc2626', bg:'#fef2f2', border:'#fecaca' },
};

function Badge({ label, color, bg, border }) {
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase', color, background:bg, border:`1px solid ${border}` }}>{label}</span>;
}

export default function AdminDashboard() {
  const [complaints,  setComplaints] = useState([]);
  const [teams,       setTeams]      = useState([]);
  const [filter,      setFilter]     = useState('ALL');
  const [search,      setSearch]     = useState('');
  const [loading,     setLoading]    = useState(true);
  const [assignModal, setAssignModal]= useState(null);
  const [updateModal, setUpdateModal]= useState(null);
  const [mounted,     setMounted]    = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const fetchAll = useCallback(async()=>{
    setLoading(true);
    try{ const [cr,tr]=await Promise.all([adminAPI.getAllComplaints(),adminAPI.getTeams()]); setComplaints(cr.data.data||[]); setTeams(tr.data.data||[]); }
    catch{ toast.error('Failed to load'); }
    finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ fetchAll(); },[fetchAll]);

  const filtered = complaints.filter(c=>filter==='ALL'||c.status===filter).filter(c=>!search||c.title?.toLowerCase().includes(search.toLowerCase())||c.complaintID?.toString().includes(search)||c.raisedBy?.toLowerCase().includes(search.toLowerCase()));
  const counts = FILTERS.slice(1).reduce((a,s)=>{ a[s]=complaints.filter(c=>c.status===s).length; return a; },{});

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fc' }}>
      <Navbar />
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'36px 28px' }}>

        {/* Header */}
        <div style={{ marginBottom:28, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, color:'#0f172a', letterSpacing:'-0.02em', marginBottom:4 }}>Admin Dashboard</h1>
          <p style={{ color:'#94a3b8', fontSize:14 }}>{complaints.length} total complaints · {teams.length} teams configured</p>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:24, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'all 0.5s 0.08s cubic-bezier(0.16,1,0.3,1)' }}>
          {FILTERS.slice(1).map(s=>{
            const cfg=SC[s]; const active=filter===s;
            return (
              <div key={s} onClick={()=>setFilter(active?'ALL':s)} style={{ padding:'18px 16px', borderRadius:14, cursor:'pointer', background:active?cfg.bg:'#fff', border:`1.5px solid ${active?cfg.border:'#e2e8f0'}`, boxShadow:active?`0 4px 16px ${cfg.color}15`:'0 1px 4px rgba(0,0,0,0.04)', transition:'all 0.2s', transform:active?'scale(1.02)':'scale(1)' }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:active?cfg.color:'#0f172a' }}>{counts[s]||0}</div>
                <div style={{ fontSize:11, color:active?cfg.color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:4 }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Search + filter */}
        <div style={{ display:'flex', gap:12, marginBottom:18, flexWrap:'wrap', opacity:mounted?1:0, transition:'all 0.5s 0.12s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ position:'relative', flex:'0 0 260px' }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', fontSize:14 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, ID, user…" style={{ width:'100%', padding:'10px 12px 10px 34px', fontSize:14 }}/>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {FILTERS.map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{ padding:'9px 18px', borderRadius:20, cursor:'pointer', background:filter===s?'#0f2444':'#fff', color:filter===s?'#fff':'#64748b', fontWeight:600, fontSize:12, border:`1.5px solid ${filter===s?'#0f2444':'#e2e8f0'}`, transition:'all 0.2s' }}>
                {s==='ALL'?`All (${complaints.length})`:s.replace('_',' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #e2e8f0', overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', opacity:mounted?1:0, transition:'all 0.5s 0.16s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 120px 110px 130px 150px 140px 150px', padding:'12px 22px', background:'#f8f9fc', borderBottom:'1.5px solid #e2e8f0' }}>
            {['#','Title','Category','Priority','Status','Raised By','Team','Actions'].map(h=>(
              <span key={h} style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94a3b8' }}>{h}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:60, gap:12 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', border:'2.5px solid #e2e8f0', borderTopColor:'#2563eb', animation:'spin 0.8s linear infinite' }}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <span style={{ color:'#94a3b8', fontSize:14 }}>Loading complaints…</span>
            </div>
          ) : filtered.length===0 ? (
            <div style={{ textAlign:'center', padding:'60px 40px' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🔎</div>
              <p style={{ color:'#94a3b8', fontSize:15 }}>No complaints found</p>
            </div>
          ) : filtered.map((c,i)=>{
            const sc=SC[c.status]||{}; const pc=PC[c.priority]||{};
            const canAssign=c.status==='RAISED';
            const canUpdate=['IN_PROGRESS','ESCALATED'].includes(c.status);
            return (
              <div key={c.complaintID} style={{ display:'grid', gridTemplateColumns:'60px 1fr 120px 110px 130px 150px 140px 150px', padding:'14px 22px', alignItems:'center', borderBottom:'1px solid #f1f4f9', background:i%2===0?'#fff':'#fafbfc', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#f0f7ff'}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#fff':'#fafbfc'}
              >
                <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8' }}>#{c.complaintID}</span>
                <span style={{ fontSize:13, fontWeight:600, color:'#0f172a', paddingRight:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</span>
                <span style={{ fontSize:12, color:'#64748b' }}>{c.category}</span>
                <div>{c.priority&&<Badge label={c.priority} color={pc.color} bg={pc.bg} border={pc.border}/>}</div>
                <div>{sc.label&&<Badge label={sc.label} color={sc.color} bg={sc.bg} border={sc.border}/>}</div>
                <span style={{ fontSize:13, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.raisedBy||'—'}</span>
                <span style={{ fontSize:12, color:c.assignedTeam?'#7c3aed':'#cbd5e1', fontWeight:c.assignedTeam?600:400 }}>{c.assignedTeam||'Unassigned'}</span>
                <div style={{ display:'flex', gap:6 }}>
                  {canAssign&&<button onClick={()=>setAssignModal(c)} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #bfdbfe', cursor:'pointer', background:'#eff6ff', color:'#2563eb', fontWeight:700, fontSize:11 }}>Assign</button>}
                  {canUpdate&&<button onClick={()=>setUpdateModal(c)} style={{ padding:'6px 12px', borderRadius:8, border:'1.5px solid #fde68a', cursor:'pointer', background:'#fffbeb', color:'#d97706', fontWeight:700, fontSize:11 }}>Update</button>}
                  {!canAssign&&!canUpdate&&<span style={{ fontSize:11, color:'#cbd5e1' }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length>0&&<p style={{ textAlign:'center', color:'#94a3b8', fontSize:12, marginTop:14 }}>Showing {filtered.length} of {complaints.length} complaints</p>}
      </div>

      {assignModal&&<AssignModal complaint={assignModal} teams={teams} onClose={()=>setAssignModal(null)} onSuccess={()=>{ setAssignModal(null); fetchAll(); }}/>}
      {updateModal&&<StatusUpdateModal complaint={updateModal} onClose={()=>setUpdateModal(null)} onSuccess={()=>{ setUpdateModal(null); fetchAll(); }}/>}
    </div>
  );
}