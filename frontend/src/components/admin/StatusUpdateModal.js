import React, { useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TRANSITIONS = { IN_PROGRESS:['ESCALATED','RESOLVED','CLOSED'], ESCALATED:['RESOLVED','CLOSED'] };
const OPT = {
  ESCALATED: { color:'#dc2626', bg:'#fef2f2', border:'#fecaca', icon:'🚨', desc:'Urgent attention needed' },
  RESOLVED:  { color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', icon:'✅', desc:'Issue has been fixed' },
  CLOSED:    { color:'#64748b', bg:'#f8fafc', border:'#e2e8f0', icon:'🔒', desc:'No further action needed' },
};
const L = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', marginBottom:10 };

export default function StatusUpdateModal({ complaint, onClose, onSuccess }) {
  const [newStatus, setNewStatus] = useState('');
  const [remarks,   setRemarks]   = useState('');
  const [loading,   setLoading]   = useState(false);

  const options = TRANSITIONS[complaint.status]||['RESOLVED','CLOSED'];

  const handleUpdate = async()=>{
    if(!newStatus){ toast.error('Select a status'); return; }
    setLoading(true);
    try{ await adminAPI.updateStatus(complaint.complaintID,{newStatus,remarks}); toast.success(`Updated to ${newStatus}`); onSuccess(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:460, borderRadius:20, background:'#fff', border:'1.5px solid #e2e8f0', boxShadow:'0 24px 64px rgba(0,0,0,0.15)', overflow:'hidden' }}>

        <div style={{ padding:'22px 28px', borderBottom:'1px solid #f1f4f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#d97706,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🔄</div>
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:'#0f172a' }}>Update Status</h2>
              <p style={{ color:'#94a3b8', fontSize:12, marginTop:1 }}>Move this complaint forward</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8f9fc', color:'#64748b', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <div style={{ padding:'24px 28px' }}>
          <div style={{ padding:'12px 16px', borderRadius:10, background:'#f8f9fc', border:'1.5px solid #e2e8f0', marginBottom:8 }}>
            <span style={{ color:'#94a3b8', fontSize:12, fontWeight:700 }}>#{complaint.complaintID} </span>
            <span style={{ color:'#0f172a', fontSize:14, fontWeight:600 }}>{complaint.title}</span>
          </div>
          <div style={{ marginBottom:22 }}>
            <span style={{ fontSize:12, color:'#94a3b8' }}>Current status: </span>
            <span style={{ fontSize:13, fontWeight:700, color:'#d97706' }}>{complaint.status?.replace('_',' ')}</span>
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={L}>New Status *</label>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {options.map(s=>{
                const cfg=OPT[s]||{};
                return (
                  <div key={s} onClick={()=>setNewStatus(s)} style={{ padding:'14px 16px', borderRadius:10, cursor:'pointer', background:newStatus===s?cfg.bg:'#fff', border:`1.5px solid ${newStatus===s?cfg.border:'#e2e8f0'}`, transition:'all 0.2s', display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:20 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:newStatus===s?cfg.color:'#0f172a' }}>{s.replace('_',' ')}</div>
                      <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{cfg.desc}</div>
                    </div>
                    {newStatus===s&&<span style={{ marginLeft:'auto', color:cfg.color, fontSize:18 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={L}>Remarks (optional)</label>
            <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} rows={3} placeholder="Reason for status change…" style={{ width:'100%', padding:'12px 14px', fontSize:14, resize:'vertical' }}/>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:10, cursor:'pointer', background:'#f8f9fc', border:'1.5px solid #e2e8f0', color:'#64748b', fontWeight:700, fontSize:14 }}>Cancel</button>
            <button onClick={handleUpdate} disabled={loading||!newStatus} style={{ flex:2, padding:'13px', borderRadius:10, border:'none', cursor:loading||!newStatus?'not-allowed':'pointer', background:loading||!newStatus?'#86efac':'#059669', color:'#fff', fontWeight:700, fontSize:14, boxShadow:loading||!newStatus?'none':'0 4px 16px rgba(5,150,105,0.3)' }}>
              {loading?'Updating…':'✅ Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}