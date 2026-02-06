import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

function Home() {
  return (
    <div className="home-container">
      
      {/* SECCIÓN HERO (PRINCIPAL) */}
      <section className="hero-section">
        
        {/* COLUMNA IZQUIERDA: TEXTO Y ACCIÓN */}
        <div className="hero-content">
          
          {/* 1. Chips de Servicios (Como Internxt) */}
          <div className="service-chips">
            <div className="chip"><Icons.Lock /> Secure Drop</div>
            <div className="chip"><Icons.Shield /> Dead Man Switch</div>
            <div className="chip"><Icons.Send /> Anon Mail</div>
          </div>

          {/* 2. Título Principal */}
          <h1 className="hero-title">
            Tu privacidad no es negociable.<br />
            <span className="text-gradient">Es matemática pura.</span>
          </h1>

          <p className="hero-desc">
            Infraestructura de intercambio de secretos <strong>Zero-Knowledge</strong>. 
            Tus datos se cifran en tu dispositivo antes de salir. 
            Nosotros no podemos leerlos, aunque nos obliguen.
          </p>

          {/* 3. Lista de Beneficios (Checkmarks) */}
          <div className="hero-checklist">
            <div className="check-item">
              <span className="check-icon">✓</span> Código Abierto y Auditable
            </div>
            <div className="check-item">
              <span className="check-icon">✓</span> Cifrado Militar XChaCha20-Poly1305
            </div>
            <div className="check-item">
              <span className="check-icon">✓</span> Sin registros (No-Logs Policy)
            </div>
          </div>

          {/* 4. Botones (Tamaño normal) */}
          <div className="hero-actions">
            <Link to="/register" className="btn-hero btn-main">
              Empezar Gratis
            </Link>
            <div className="trust-badge">
              <span className="dot"></span> Garantía de anonimato
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: VISUAL (DASHBOARD FLOTANTE) */}
        <div className="hero-visual">
          <div className="glass-card-visual">
            <div className="visual-header">
              <div className="visual-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="visual-bar">zyphro.com/secure-drop</div>
            </div>
            <div className="visual-body">
              <div className="visual-row">
                <div className="visual-icon"><Icons.Lock /></div>
                <div className="visual-text">
                  <div className="line short"></div>
                  <div className="line long"></div>
                </div>
              </div>
              <div className="visual-code-block">
                Lx8/oOshN3SYLL4Vp0BeXjrLc3dVQg...
              </div>
              <div className="visual-btn">Encriptar</div>
            </div>
            {/* Tarjeta Flotante Decorativa */}
            <div className="float-card">
              <Icons.Shield />
              <span>100% Secure</span>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}

export default Home;