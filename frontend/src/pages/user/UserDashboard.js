import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import ComplaintCard from '../../components/user/ComplaintCard';
import RaiseComplaintModal from '../../components/user/RaiseComplaintModal';
import { complaintAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const STATUSES = ['ALL','RAISED','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED'];
const STATUS_CONFIG = {
  RAISED:      { color:'#2563eb', bg:'#eff6ff', label:'Raised',      icon:'📋' },
  IN_PROGRESS: { color:'#d97706', bg:'#fffbeb', label:'In Progress', icon:'⚡' },
  ESCALATED:   { color:'#dc2626', bg:'#fef2f2', label:'Escalated',   icon:'🚨' },
  RESOLVED:    { color:'#059669', bg:'#ecfdf5', label:'Resolved',    icon:'✅' },
  CLOSED:      { color:'#64748b', bg:'#f8fafc', label:'Closed',      icon:'🔒' },
};

export default function UserDashboard() {
  const { user }   = useAuth();
  const [complaints,  setComplaints] = useState([]);
  const [filter,      setFilter]     = useState('ALL');
  const [loading,     setLoading]    = useState(true);
  const [showModal,   setShowModal]  = useState(false);
  const [mounted,     setMounted]    = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const fetchComplaints = useCallback(async()=>{
    try{ const r=await complaintAPI.getMyComplaints(); setComplaints(r.data.data||[]); }
    catch{ toast.error('Failed to load'); }
    finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ fetchComplaints(); },[fetchComplaints]);

  const filtered = filter==='ALL' ? complaints : complaints.filter(c=>c.status===filter);
  const counts   = STATUSES.slice(1).reduce((a,s)=>{ a[s]=complaints.filter(c=>c.status===s).length; return a; },{});

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fc' }}>
      <Navbar />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 28px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <div>
            <p style={{ color:'#94a3b8', fontSize:14, fontWeight:500, marginBottom:4 }}>Good day,</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, color:'#0f172a', letterSpacing:'-0.02em', lineHeight:1.2 }}>
              {user?.userName}
            </h1>
            <p style={{ color:'#94a3b8', fontSize:14, marginTop:6 }}>{complaints.length} complaint{complaints.length!==1?'s':''} on record</p>
          </div>
          <button onClick={()=>setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 24px', border:'none', borderRadius:12, background:'#0f2444', color:'#fff', fontWeight:700, fontSize:14, boxShadow:'0 4px 20px rgba(15,36,68,0.3)', cursor:'pointer', letterSpacing:'0.01em' }}>
            <span style={{ fontSize:18 }}>+</span> Raise Complaint
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:28, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'all 0.5s 0.08s cubic-bezier(0.16,1,0.3,1)' }}>
          {STATUSES.slice(1).map(s=>{
            const cfg=STATUS_CONFIG[s]; const active=filter===s;
            return (
              <div key={s} onClick={()=>setFilter(active?'ALL':s)} style={{ padding:'20px 18px', borderRadius:14, cursor:'pointer', background:active?cfg.bg:'#fff', border:`1.5px solid ${active?cfg.color+'40':'#e2e8f0'}`, boxShadow:active?`0 4px 16px ${cfg.color}18`:'0 1px 4px rgba(0,0,0,0.04)', transition:'all 0.2s', transform:active?'scale(1.02)':'scale(1)' }}>
                <div style={{ fontSize:22, marginBottom:10 }}>{cfg.icon}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700, color:active?cfg.color:'#0f172a', lineHeight:1 }}>{counts[s]||0}</div>
                <div style={{ fontSize:11, color:active?cfg.color:'#94a3b8', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:5 }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div style={{ display:'flex', gap:8, marginBottom:22, flexWrap:'wrap', opacity:mounted?1:0, transition:'all 0.5s 0.16s cubic-bezier(0.16,1,0.3,1)' }}>
          {STATUSES.map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{ padding:'8px 18px', borderRadius:20, cursor:'pointer', background:filter===s?'#0f2444':'#fff', color:filter===s?'#fff':'#64748b', fontWeight:600, fontSize:13, border:`1.5px solid ${filter===s?'#0f2444':'#e2e8f0'}`, transition:'all 0.2s' }}>
              {s==='ALL'?`All (${complaints.length})`:s.replace('_',' ')}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#2563eb', animation:'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length===0 ? (
          <div style={{ textAlign:'center', padding:'70px 40px', background:'#fff', borderRadius:18, border:'1.5px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>📭</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:8 }}>{filter==='ALL'?'No complaints yet':`No ${filter.replace('_',' ')} complaints`}</h3>
            <p style={{ color:'#94a3b8', fontSize:14 }}>{filter==='ALL'?'Click "Raise Complaint" to submit your first issue':'Try a different filter'}</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {filtered.map((c,i)=>(
              <div key={c.complaintID} style={{ opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(12px)', transition:`all 0.4s ${0.12+i*0.05}s cubic-bezier(0.16,1,0.3,1)` }}>
                <ComplaintCard complaint={c}/>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <RaiseComplaintModal onClose={()=>setShowModal(false)} onSuccess={()=>{ setShowModal(false); fetchComplaints(); }}/>}
    </div>
  );
}