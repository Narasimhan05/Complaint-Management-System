import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [unread,   setUnread]   = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    const fn = async()=>{ try{ const r=await notificationAPI.getUnreadCount(); setUnread(r.data.data||0); }catch{} };
    fn(); const id=setInterval(fn,30000); return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>4);
    window.addEventListener('scroll',fn); return()=>window.removeEventListener('scroll',fn);
  },[]);

  const links = isAdmin()
    ? [{to:'/admin/dashboard',label:'Dashboard'},{to:'/admin/teams',label:'Teams'}]
    : [{to:'/user/dashboard', label:'Dashboard'}];

  return (
    <nav style={{ position:'sticky', top:0, zIndex:100, background:'#fff', borderBottom:`1px solid ${scrolled?'#e2e8f0':'#f1f4f9'}`, boxShadow:scrolled?'0 1px 12px rgba(0,0,0,0.06)':'none', transition:'all 0.3s' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 28px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        {/* Brand */}
        <Link to={isAdmin()?'/admin/dashboard':'/user/dashboard'} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#0f2444,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, boxShadow:'0 2px 10px rgba(15,36,68,0.3)' }}>🛡️</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:'#0f2444', letterSpacing:'-0.01em' }}>ComplaintMS</span>
        </Link>

        {/* Links */}
        <div style={{ display:'flex', alignItems:'center', gap:2 }}>
          {links.map(link=>{
            const active = location.pathname===link.to;
            return (
              <Link key={link.to} to={link.to} style={{ textDecoration:'none', padding:'7px 18px', borderRadius:8, background:active?'#eff6ff':'transparent', color:active?'#2563eb':'#64748b', fontWeight:active?700:500, fontSize:14, transition:'all 0.2s', border:`1px solid ${active?'#bfdbfe':'transparent'}` }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button style={{ position:'relative', width:38, height:38, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
            🔔
            {unread>0 && (
              <span style={{ position:'absolute', top:-5, right:-5, background:'#dc2626', color:'#fff', fontSize:9, fontWeight:800, minWidth:17, height:17, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:'2px solid #fff' }}>
                {unread>9?'9+':unread}
              </span>
            )}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'5px 14px 5px 6px', background:'#f8f9fc', border:'1.5px solid #e2e8f0', borderRadius:12 }}>
            <div style={{ width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:13, color:'#fff', background:isAdmin()?'linear-gradient(135deg,#0f2444,#1e3a5f)':'linear-gradient(135deg,#2563eb,#3b82f6)' }}>
              {user?.userName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#0f172a', lineHeight:1.2 }}>{user?.userName}</div>
              <div style={{ fontSize:10, color:isAdmin()?'#0f2444':'#2563eb', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{user?.roleName}</div>
            </div>
          </div>

          <button onClick={logout} style={{ padding:'8px 16px', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#fff', color:'#64748b', fontWeight:600, fontSize:13 }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}