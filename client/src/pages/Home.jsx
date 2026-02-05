import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="hero-wrapper">
      <h1 className="hero-title">Seguridad <span style={{color: 'var(--primary)'}}>Nativa.</span></h1>
      <p className="hero-subtitle">Infraestructura Web Crypto API. Cifrado AES-GCM acelerado por hardware directamente en tu navegador. Privacidad absoluta.</p>
      <div>
        <button className="btn-hero" onClick={() => navigate('/drop')}>
          Probar Ahora Gratis
        </button>
      </div>
    </div>
  );
}

// 👇 ESTA LÍNEA ES LA QUE TE FALTA 👇
export default Home;