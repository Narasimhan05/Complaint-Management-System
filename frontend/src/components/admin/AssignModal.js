import React, { useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const L = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', marginBottom:10 };

export default function AssignModal({ complaint, teams, onClose, onSuccess }) {
  const [teamId,  setTeamId]  = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async()=>{
    if(!teamId){ toast.error('Select a team'); return; }
    setLoading(true);
    try{ await adminAPI.assign(complaint.complaintID,{teamId:parseInt(teamId),notes}); toast.success('Assigned!'); onSuccess(); }
    catch(err){ toast.error(err.response?.data?.message||'Failed'); }
    finally{ setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:500, borderRadius:20, background:'#fff', border:'1.5px solid #e2e8f0', boxShadow:'0 24px 64px rgba(0,0,0,0.15)', overflow:'hidden' }}>

        <div style={{ padding:'22px 28px', borderBottom:'1px solid #f1f4f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#0f2444,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>👥</div>
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:'#0f172a' }}>Assign Complaint</h2>
              <p style={{ color:'#94a3b8', fontSize:12, marginTop:1 }}>Select a team to handle this issue</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8f9fc', color:'#64748b', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <div style={{ padding:'24px 28px' }}>
          <div style={{ padding:'12px 16px', borderRadius:10, background:'#f8f9fc', border:'1.5px solid #e2e8f0', marginBottom:22 }}>
            <span style={{ color:'#94a3b8', fontSize:12, fontWeight:700 }}>#{complaint.complaintID} </span>
            <span style={{ color:'#0f172a', fontSize:14, fontWeight:600 }}>{complaint.title}</span>
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={L}>Select Team *</label>
            {teams.length===0 ? (
              <div style={{ padding:16, borderRadius:10, background:'#fef2f2', border:'1.5px solid #fecaca', color:'#dc2626', fontSize:14, textAlign:'center' }}>
                ⚠️ No teams found. Create teams from the Teams page first.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {teams.map(t=>(
                  <div key={t.teamId} onClick={()=>setTeamId(t.teamId)} style={{ padding:'14px 16px', borderRadius:10, cursor:'pointer', background:teamId===t.teamId?'#eff6ff':'#fff', border:`1.5px solid ${teamId===t.teamId?'#2563eb':'#e2e8f0'}`, transition:'all 0.2s', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:34, height:34, borderRadius:8, flexShrink:0, background:teamId===t.teamId?'#2563eb':'#f1f4f9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:teamId===t.teamId?'#fff':'#64748b' }}>
                      {t.teamName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:teamId===t.teamId?'#2563eb':'#0f172a' }}>{t.teamName}</div>
                      {t.description&&<div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{t.description}</div>}
                    </div>
                    {teamId===t.teamId&&<span style={{ marginLeft:'auto', color:'#2563eb', fontSize:18 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={L}>Notes (optional)</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Any context for the team…" style={{ width:'100%', padding:'12px 14px', fontSize:14, resize:'vertical' }}/>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:10, cursor:'pointer', background:'#f8f9fc', border:'1.5px solid #e2e8f0', color:'#64748b', fontWeight:700, fontSize:14 }}>Cancel</button>
            <button onClick={handleAssign} disabled={loading||!teamId||teams.length===0} style={{ flex:2, padding:'13px', borderRadius:10, border:'none', cursor:loading||!teamId?'not-allowed':'pointer', background:loading||!teamId?'#93c5fd':'#2563eb', color:'#fff', fontWeight:700, fontSize:14, boxShadow:loading||!teamId?'none':'0 4px 16px rgba(37,99,235,0.3)' }}>
              {loading?'Assigning…':'✅ Assign Team'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}