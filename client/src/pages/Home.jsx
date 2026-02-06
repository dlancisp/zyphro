import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  return (
    <div className="hero-wrapper">
      <h1 className="hero-title">Seguridad <span style={{color: 'var(--primary)'}}>Nativa.</span></h1>
      <p className="hero-subtitle">
        Infraestructura de intercambio de secretos Zero-Knowledge. 
        Protegido con <strong>XChaCha20-Poly1305</strong> y derivación de claves <strong>PBKDF2</strong>. 
        Privacidad absoluta.
      </p>
      <div>
        <button className="btn-hero" onClick={() => navigate('/drop')}>
          Probar Ahora Gratis
        </button>
      </div>
    </div>
  );
}

export default Home;