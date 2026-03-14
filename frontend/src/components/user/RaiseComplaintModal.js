import React, { useState } from 'react';
import { complaintAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Technical','Billing','HR','Security','Infrastructure','Other'];
const PRIORITIES = [
  { value:'LOW',      color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', label:'Low',      desc:'Non-urgent' },
  { value:'MEDIUM',   color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'Medium',   desc:'Moderate' },
  { value:'HIGH',     color:'#ea580c', bg:'#fff7ed', border:'#fed7aa', label:'High',     desc:'Significant' },
  { value:'CRITICAL', color:'#dc2626', bg:'#fef2f2', border:'#fecaca', label:'Critical', desc:'Immediate' },
];
const L = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#64748b', marginBottom:8 };

export default function RaiseComplaintModal({ onClose, onSuccess }) {
  const [form, setForm]       = useState({ title:'', description:'', category:'Technical', priority:'MEDIUM' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim())       { toast.error('Title required'); return; }
    if (!form.description.trim()) { toast.error('Description required'); return; }
    setLoading(true);
    try { await complaintAPI.raise(form); toast.success('Complaint raised!'); onSuccess(); }
    catch(err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(15,23,42,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:540, borderRadius:20, background:'#fff', border:'1.5px solid #e2e8f0', boxShadow:'0 24px 64px rgba(0,0,0,0.15)', overflow:'hidden' }}>

        <div style={{ padding:'22px 28px', borderBottom:'1px solid #f1f4f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#2563eb,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, boxShadow:'0 4px 12px rgba(37,99,235,0.3)' }}>📝</div>
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:'#0f172a', letterSpacing:'-0.01em' }}>Raise Complaint</h2>
              <p style={{ color:'#94a3b8', fontSize:12, marginTop:1 }}>Submit a new issue for resolution</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1.5px solid #e2e8f0', background:'#f8f9fc', color:'#64748b', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:'24px 28px' }}>
          <div style={{ marginBottom:18 }}>
            <label style={L}>Title *</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Brief description of the issue" style={{ width:'100%', padding:'12px 14px', fontSize:14 }}/>
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={L}>Description *</label>
            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={4} placeholder="Explain the issue in detail…" style={{ width:'100%', padding:'12px 14px', fontSize:14, resize:'vertical' }}/>
          </div>
          <div style={{ marginBottom:18 }}>
            <label style={L}>Category</label>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {CATEGORIES.map(c=>(
                <button key={c} type="button" onClick={()=>setForm(f=>({...f,category:c}))} style={{ padding:'7px 14px', borderRadius:20, cursor:'pointer', border:`1.5px solid ${form.category===c?'#2563eb':'#e2e8f0'}`, background:form.category===c?'#eff6ff':'#fff', color:form.category===c?'#2563eb':'#64748b', fontWeight:600, fontSize:12, transition:'all 0.15s' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:26 }}>
            <label style={L}>Priority</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
              {PRIORITIES.map(p=>(
                <div key={p.value} onClick={()=>setForm(f=>({...f,priority:p.value}))} style={{ padding:'12px 8px', borderRadius:10, cursor:'pointer', textAlign:'center', background:form.priority===p.value?p.bg:'#fff', border:`1.5px solid ${form.priority===p.value?p.border:'#e2e8f0'}`, transition:'all 0.2s' }}>
                  <div style={{ fontWeight:800, fontSize:13, color:form.priority===p.value?p.color:'#64748b' }}>{p.label}</div>
                  <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button type="button" onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:10, cursor:'pointer', background:'#f8f9fc', border:'1.5px solid #e2e8f0', color:'#64748b', fontWeight:700, fontSize:14 }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex:2, padding:'13px', borderRadius:10, border:'none', cursor:loading?'not-allowed':'pointer', background:loading?'#93c5fd':'#2563eb', color:'#fff', fontWeight:700, fontSize:14, boxShadow:loading?'none':'0 4px 16px rgba(37,99,235,0.3)' }}>
              {loading?'Submitting…':'🚀 Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}