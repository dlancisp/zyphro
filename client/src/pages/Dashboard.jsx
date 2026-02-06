import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { Icons } from "../components/Icons";

function Dashboard() {
  const { user } = useUser();

  return (
    <div className="feature-wrapper" style={{maxWidth: '1000px', margin: '40px auto'}}>
      
      {/* Cabecera del Usuario */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'1px solid var(--border-color)', paddingBottom:'20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <img src={user?.imageUrl} alt="Profile" style={{width:'60px', height:'60px', borderRadius:'50%'}} />
          <div>
            <h2 style={{fontSize:'1.5rem', margin:0}}>Hola, {user?.firstName || "Usuario"}! 👋</h2>
            <p style={{color:'var(--text-muted)', margin:0}}>{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
        <SignOutButton>
          <button className="btn-hero" style={{padding:'8px 16px', fontSize:'0.9rem', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', color:'var(--text-heading)'}}>
            Cerrar Sesión
          </button>
        </SignOutButton>
      </div>

      {/* Panel de Control */}
      <h3 className="section-title" style={{fontSize:'1.2rem', marginBottom:'20px'}}>Tus Herramientas</h3>
      
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px'}}>
        
        {/* Secure Drop */}
        <div className="feature-card" style={{border:'1px solid var(--border-color)', padding:'25px', borderRadius:'12px', background:'var(--bg-secondary)'}}>
          <div style={{color:'var(--primary)', marginBottom:'15px'}}><Icons.Lock /></div>
          <h4 style={{margin:'0 0 10px 0'}}>Secure Drop</h4>
          <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Envía secretos encriptados con XChaCha20.</p>
          <Link to="/drop" className="btn-hero" style={{display:'inline-block', marginTop:'15px', width:'100%', textAlign:'center', textDecoration:'none'}}>
            Nuevo Secreto
          </Link>
        </div>

        {/* Dead Man Switch */}
        <div className="feature-card" style={{border:'1px solid var(--border-color)', padding:'25px', borderRadius:'12px', background:'var(--bg-secondary)', opacity: 0.8}}>
          <div style={{color:'#ef4444', marginBottom:'15px'}}><Icons.Shield /></div>
          <h4 style={{margin:'0 0 10px 0'}}>Dead Man Switch</h4>
          <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Gestión de testamento digital.</p>
          <Link to="/switch" className="btn-hero" style={{display:'inline-block', marginTop:'15px', width:'100%', textAlign:'center', textDecoration:'none', background:'#333'}}>
            Configurar (Pronto)
          </Link>
        </div>

        {/* Anon Mail */}
        <div className="feature-card" style={{border:'1px solid var(--border-color)', padding:'25px', borderRadius:'12px', background:'var(--bg-secondary)', opacity: 0.8}}>
          <div style={{color:'#10b981', marginBottom:'15px'}}><Icons.Send /></div>
          <h4 style={{margin:'0 0 10px 0'}}>Anon Mail</h4>
          <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Correos temporales indetectables.</p>
          <Link to="/mail" className="btn-hero" style={{display:'inline-block', marginTop:'15px', width:'100%', textAlign:'center', textDecoration:'none', background:'#333'}}>
            Abrir Buzón (Pronto)
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;