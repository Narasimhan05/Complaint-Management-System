import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';

const L = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', marginBottom:8 };

export default function AdminTeams() {
  const [teams,    setTeams]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [form,     setForm]     = useState({ teamName:'', description:'', contactEmail:'' });
  const [mounted,  setMounted]  = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);

  const fetchTeams = useCallback(async()=>{
    setLoading(true);
    try{ const r=await adminAPI.getTeams(); setTeams(r.data.data||[]); }
    catch{ toast.error('Failed to load'); }
    finally{ setLoading(false); }
  },[]);

  useEffect(()=>{ fetchTeams(); },[fetchTeams]);

  const resetForm = ()=>{ setForm({teamName:'',description:'',contactEmail:''}); setShowForm(false); setEditTeam(null); };

  const handleSubmit = async()=>{
    if(!form.teamName.trim()){ toast.error('Team name required'); return; }
    try{
      if(editTeam){ await adminAPI.updateTeam(editTeam.teamId,form); toast.success('Updated!'); }
      else        { await adminAPI.createTeam(form); toast.success('Team created!'); }
      resetForm(); fetchTeams();
    } catch(err){ toast.error(err.response?.data?.message||'Failed'); }
  };

  const handleDelete = async(id,name)=>{
    if(!window.confirm(`Delete "${name}"?`)) return;
    try{ await adminAPI.deleteTeam(id); toast.success('Deleted'); fetchTeams(); }
    catch{ toast.error('Failed'); }
  };

  const handleEdit = t=>{ setEditTeam(t); setForm({teamName:t.teamName||'',description:t.description||'',contactEmail:t.contactEmail||''}); setShowForm(true); };

  return (
    <div style={{ minHeight:'100vh', background:'#f8f9fc' }}>
      <Navbar />
      <div style={{ maxWidth:900, margin:'0 auto', padding:'36px 28px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(16px)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, color:'#0f172a', letterSpacing:'-0.02em', marginBottom:4 }}>Teams</h1>
            <p style={{ color:'#94a3b8', fontSize:14 }}>{teams.length} team{teams.length!==1?'s':''} configured</p>
          </div>
          <button onClick={()=>{ resetForm(); setShowForm(true); }} style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 24px', border:'none', borderRadius:12, background:'#0f2444', color:'#fff', fontWeight:700, fontSize:14, boxShadow:'0 4px 20px rgba(15,36,68,0.3)', cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>+</span> New Team
          </button>
        </div>

        {/* Form */}
        {showForm&&(
          <div style={{ background:'#fff', border:'1.5px solid #bfdbfe', borderRadius:16, padding:'26px 28px', marginBottom:22, boxShadow:'0 4px 20px rgba(37,99,235,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:'#0f172a' }}>{editTeam?'Edit Team':'Create New Team'}</h3>
              <button onClick={resetForm} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:22, cursor:'pointer' }}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              {[{label:'Team Name *',key:'teamName',ph:'e.g. IT Support'},{label:'Contact Email',key:'contactEmail',ph:'team@company.com'}].map(f=>(
                <div key={f.key}>
                  <label style={L}>{f.label}</label>
                  <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{ width:'100%', padding:'12px 14px', fontSize:14 }}/>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:22 }}>
              <label style={L}>Description</label>
              <input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="What does this team handle?" style={{ width:'100%', padding:'12px 14px', fontSize:14 }}/>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={resetForm} style={{ flex:1, padding:'12px', borderRadius:10, cursor:'pointer', background:'#f8f9fc', border:'1.5px solid #e2e8f0', color:'#64748b', fontWeight:700, fontSize:14 }}>Cancel</button>
              <button onClick={handleSubmit} style={{ flex:2, padding:'12px', borderRadius:10, border:'none', cursor:'pointer', background:'#0f2444', color:'#fff', fontWeight:700, fontSize:14, boxShadow:'0 4px 16px rgba(15,36,68,0.3)' }}>
                {editTeam?'✅ Update Team':'🚀 Create Team'}
              </button>
            </div>
          </div>
        )}

        {/* Teams list */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60, gap:12, alignItems:'center' }}>
            <div style={{ width:24, height:24, borderRadius:'50%', border:'2.5px solid #e2e8f0', borderTopColor:'#0f2444', animation:'spin 0.8s linear infinite' }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ color:'#94a3b8' }}>Loading…</span>
          </div>
        ) : teams.length===0 ? (
          <div style={{ textAlign:'center', padding:'70px 40px', background:'#fff', borderRadius:18, border:'1.5px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>👥</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:8 }}>No teams yet</h3>
            <p style={{ color:'#94a3b8', fontSize:14, marginBottom:20 }}>Create your first team to start assigning complaints</p>
            <button onClick={()=>setShowForm(true)} style={{ padding:'12px 24px', borderRadius:12, border:'none', cursor:'pointer', background:'#0f2444', color:'#fff', fontWeight:700, boxShadow:'0 4px 16px rgba(15,36,68,0.3)' }}>+ Create First Team</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {teams.map((team,i)=>(
              <div key={team.teamId} style={{ padding:'20px 24px', borderRadius:14, background:'#fff', border:'1.5px solid #e2e8f0', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', display:'flex', alignItems:'center', gap:16, transition:'all 0.2s', opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(10px)', transitionDelay:`${i*0.05}s` }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='#bfdbfe'; e.currentTarget.style.boxShadow='0 4px 16px rgba(37,99,235,0.08)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                <div style={{ width:48, height:48, borderRadius:14, flexShrink:0, background:'linear-gradient(135deg,#0f2444,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:20, color:'#fff', boxShadow:'0 4px 12px rgba(15,36,68,0.3)' }}>
                  {team.teamName?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>{team.teamName}</span>
                    <span style={{ fontSize:10, color:'#94a3b8', background:'#f1f4f9', padding:'2px 8px', borderRadius:20, fontWeight:600 }}>#{team.teamId}</span>
                  </div>
                  {team.description&&<p style={{ color:'#64748b', fontSize:13, marginBottom:2 }}>{team.description}</p>}
                  {team.contactEmail&&<p style={{ color:'#2563eb', fontSize:12 }}>✉ {team.contactEmail}</p>}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>handleEdit(team)} style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #e2e8f0', cursor:'pointer', background:'#f8f9fc', color:'#0f172a', fontWeight:700, fontSize:12 }}>Edit</button>
                  <button onClick={()=>handleDelete(team.teamId,team.teamName)} style={{ padding:'8px 16px', borderRadius:8, border:'1.5px solid #fecaca', cursor:'pointer', background:'#fef2f2', color:'#dc2626', fontWeight:700, fontSize:12 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}