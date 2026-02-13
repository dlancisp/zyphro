import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import { Icons } from "../components/Icons";

function Dashboard() {
  const { user } = useUser();

  return (
    <div className="feature-wrapper" style={{maxWidth: '1000px', margin: '40px auto', padding: '0 20px'}}>
      
      {/* CABECERA: DISEÑO COPIADO DEL FOOTER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
        <div style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            fontStyle: 'italic', 
            letterSpacing: '-0.05em', 
            color: '#2563eb', // Azul del logo
            margin: 0, 
            lineHeight: '1',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif'
          }}>
            ZYPHRO
          </h2>
          <p style={{ 
            fontSize: '11px', 
            fontWeight: '900', 
            letterSpacing: '0.5em', 
            color: '#64748b', 
            margin: '4px 0 0 2px', 
            textTransform: 'uppercase',
            fontFamily: 'sans-serif'
          }}>
            PULSE
          </p>
        </div>

        <SignOutButton>
          <button className="btn-hero" style={{padding:'10px 20px', fontSize:'0.8rem', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', color:'var(--text-heading)', borderRadius: '8px'}}>
            Cerrar Sesión
          </button>
        </SignOutButton>
      </div>

      {/* Perfil del Usuario */}
      <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'30px', borderBottom:'1px solid var(--border-color)', paddingBottom:'20px'}}>
        <img src={user?.imageUrl} alt="Profile" style={{width:'60px', height:'60px', borderRadius:'50%'}} />
        <div>
          <h2 style={{fontSize:'1.5rem', margin:0, fontWeight: '800'}}>Hola, {user?.firstName || "Usuario"}! 👋</h2>
          <p style={{color:'var(--text-muted)', margin:0}}>{user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </div>

      {/* Grid de Herramientas */}
      <h3 className="section-title" style={{fontSize:'1.2rem', marginBottom:'20px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Tus Herramientas</h3>
      
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px'}}>
        <div className="feature-card" style={{border:'1px solid var(--border-color)', padding:'25px', borderRadius:'12px', background:'var(--bg-secondary)'}}>
          <div style={{color:'var(--primary)', marginBottom:'15px'}}><Icons.Lock /></div>
          <h4 style={{margin:'0 0 10px 0', fontWeight: '800'}}>Secure Drop</h4>
          <p style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>Envía secretos encriptados con XChaCha20.</p>
          <Link to="/drop" className="btn-hero" style={{display:'inline-block', marginTop:'15px', width:'100%', textAlign:'center', textDecoration:'none'}}>
            Nuevo Secreto
          </Link>
        </div>

        {/* Repite el mismo estilo para Dead Man Switch y Anon Mail */}
      </div>
    </div>
  );
}

export default Dashboard;