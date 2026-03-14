import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Field({ label, name, type='text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color: focused?'#2563eb':'#64748b', marginBottom:7, fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'color 0.2s' }}>
        {label}
      </label>
      <input name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete="off"
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ width:'100%', padding:'13px 16px', fontSize:14.5, borderRadius:10, color:'#0f172a', background:'#fff', border:`1.5px solid ${focused?'#2563eb':'#e2e8f0'}`, boxShadow: focused?'0 0 0 3px rgba(37,99,235,0.08)':'none' }}
      />
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ userName:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(()=>setMounted(true), 60); }, []);
  const onChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.userName||!form.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.roleName==='ADMIN'?'/admin/dashboard':'/user/dashboard');
    } catch(err) { toast.error(err.response?.data?.message||'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#f8f9fc' }}>
      {/* Left panel */}
      <div style={{ flex:1, background:'linear-gradient(160deg, #0f2444 0%, #1e3a5f 60%, #1e4d8c 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 70px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, borderRadius:'50%', background:'rgba(255,255,255,0.03)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:300, height:300, borderRadius:'50%', background:'rgba(37,99,235,0.15)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:60 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🛡️</div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#fff', letterSpacing:'-0.01em' }}>ComplaintMS</span>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:48, fontWeight:700, color:'#fff', lineHeight:1.15, marginBottom:20, letterSpacing:'-0.02em' }}>
            Enterprise<br/>Complaint<br/>Management
          </h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:16, lineHeight:1.7, maxWidth:320 }}>
            Streamline complaint resolution with intelligent routing, SLA enforcement, and real-time tracking.
          </p>
          <div style={{ marginTop:48, display:'flex', flexDirection:'column', gap:14 }}>
            {['JWT-secured role-based access','Automatic SLA escalation engine','Real-time notification system'].map(f=>(
              <div key={f} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:'rgba(37,99,235,0.4)', border:'1px solid rgba(37,99,235,0.6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#93c5fd', flexShrink:0 }}>✓</div>
                <span style={{ color:'rgba(255,255,255,0.65)', fontSize:14 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width:520, display:'flex', alignItems:'center', justifyContent:'center', padding:48, background:'#fff' }}>
        <div style={{ width:'100%', maxWidth:400, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:'#0f172a', marginBottom:6, letterSpacing:'-0.02em' }}>Welcome back</h2>
          <p style={{ color:'#94a3b8', fontSize:15, marginBottom:36 }}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} noValidate>
            <Field label="Username" name="userName" value={form.userName} onChange={onChange} placeholder="Enter your username"/>
            <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Enter your password"/>
            <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', marginTop:8, border:'none', borderRadius:10, background:loading?'#93c5fd':'#2563eb', color:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, boxShadow:loading?'none':'0 4px 20px rgba(37,99,235,0.35)', letterSpacing:'0.01em' }}>
              {loading?'Signing in…':'Sign In →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:28 }}>
            <span style={{ color:'#94a3b8', fontSize:14 }}>No account? </span>
            <Link to="/register" style={{ color:'#2563eb', fontWeight:700, fontSize:14, textDecoration:'none' }}>Create one</Link>
          </div>

          <div style={{ marginTop:28, padding:'14px 18px', borderRadius:10, background:'#eff6ff', border:'1px solid #bfdbfe' }}>
            <p style={{ color:'#3b82f6', fontSize:12.5, textAlign:'center', lineHeight:1.6 }}>
              <strong>Demo:</strong> Register as <strong>ADMIN</strong> to manage complaints or <strong>USER</strong> to raise them
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ userName:'', email:'', password:'', phone:'', roleName:'USER' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),60); },[]);
  const onChange = e => setForm(f=>({...f,[e.target.name]:e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.roleName==='ADMIN'?'/admin/dashboard':'/user/dashboard');
    } catch(err) { toast.error(err.response?.data?.message||'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#f8f9fc' }}>
      <div style={{ flex:1, background:'linear-gradient(160deg,#0f2444 0%,#1e3a5f 60%,#1e4d8c 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 70px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:60 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🛡️</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:'#fff' }}>ComplaintMS</span>
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:44, fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:20, letterSpacing:'-0.02em' }}>Join the<br/>Platform</h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:16, lineHeight:1.7, maxWidth:300 }}>Create your account and start managing complaints professionally.</p>
      </div>

      <div style={{ width:580, display:'flex', alignItems:'center', justifyContent:'center', padding:48, background:'#fff' }}>
        <div style={{ width:'100%', maxWidth:460, opacity:mounted?1:0, transform:mounted?'translateY(0)':'translateY(20px)', transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:700, color:'#0f172a', marginBottom:6, letterSpacing:'-0.02em' }}>Create account</h2>
          <p style={{ color:'#94a3b8', fontSize:15, marginBottom:32 }}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Username" name="userName" value={form.userName} onChange={onChange} placeholder="Choose username"/>
              <Field label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="your@email.com"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Field label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Min 6 chars"/>
              <Field label="Phone" name="phone" value={form.phone} onChange={onChange} placeholder="10-digit number"/>
            </div>

            <div style={{ marginBottom:28 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'#64748b', marginBottom:10 }}>Account Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{value:'USER',icon:'👤',label:'User',desc:'Raise & track complaints'},{value:'ADMIN',icon:'⚡',label:'Admin',desc:'Full management access'}].map(r=>(
                  <div key={r.value} onClick={()=>setForm(f=>({...f,roleName:r.value}))} style={{ padding:'16px', borderRadius:12, cursor:'pointer', textAlign:'center', border:`2px solid ${form.roleName===r.value?'#2563eb':'#e2e8f0'}`, background:form.roleName===r.value?'#eff6ff':'#fff', transition:'all 0.2s' }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>{r.icon}</div>
                    <div style={{ fontWeight:700, fontSize:14, color:form.roleName===r.value?'#2563eb':'#0f172a' }}>{r.label}</div>
                    <div style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'14px', border:'none', borderRadius:10, background:loading?'#86efac':'#059669', color:'#fff', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, boxShadow:loading?'none':'0 4px 20px rgba(5,150,105,0.3)' }}>
              {loading?'Creating…':'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:24 }}>
            <span style={{ color:'#94a3b8', fontSize:14 }}>Have an account? </span>
            <Link to="/login" style={{ color:'#2563eb', fontWeight:700, fontSize:14, textDecoration:'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}