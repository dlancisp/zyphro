import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

function Home() {
  return (
    <div className="home-container">
      
      {/* --- SECCIÓN 1: HERO (Ya la tenías) --- */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="service-chips">
            <div className="chip"><Icons.Lock /> Secure Drop</div>
            <div className="chip"><Icons.Shield /> Dead Man Switch</div>
            <div className="chip"><Icons.Send /> Anon Mail</div>
          </div>

          <h1 className="hero-title">
            Tu privacidad no es negociable.<br />
            <span className="text-gradient">Es matemática pura.</span>
          </h1>

          <p className="hero-desc">
            Infraestructura de intercambio de secretos <strong>Zero-Knowledge</strong>. 
            Protegido con XChaCha20-Poly1305. Nosotros no podemos leer tus datos.
          </p>

          <div className="hero-checklist">
            <div className="check-item"><span className="check-icon">✓</span> Código Abierto y Auditable</div>
            <div className="check-item"><span className="check-icon">✓</span> Sin registros (No-Logs Policy)</div>
            <div className="check-item"><span className="check-icon">✓</span> Cifrado en tu dispositivo</div>
          </div>

          <div className="hero-actions">
            <Link to="/register" className="btn-hero btn-main">Empezar Gratis</Link>
            <div className="trust-badge"><span className="dot"></span> Garantía de anonimato</div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glass-card-visual">
            <div className="visual-header">
              <div className="visual-dots"><span></span><span></span><span></span></div>
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
              <div className="visual-code-block">Lx8/oOshN3SYLL4Vp0BeXjrLc3...</div>
              <div className="visual-btn">Encriptar</div>
            </div>
            <div className="float-card"><Icons.Shield /><span>100% Secure</span></div>
          </div>
        </div>
      </section>


      {/* --- SECCIÓN 2: PRECIOS (NUEVA) --- */}
      <section className="pricing-section">
        <div className="pricing-header">
          <h2 className="section-title-center">Planes simples y transparentes</h2>
          <p className="section-subtitle">Elige el nivel de anonimato que necesitas.</p>
        </div>

        <div className="pricing-grid">
          
          {/* TARJETA 1: GRATIS */}
          <div className="pricing-card">
            <h3 className="plan-name">Anónimo</h3>
            <div className="price-tag">
              <span className="amount">€0</span>
              <span className="period">/mes</span>
            </div>
            <p className="plan-desc">Para enviar secretos puntuales.</p>
            <Link to="/register" className="btn-outline">Crear Cuenta</Link>
            
            <ul className="feature-list">
              <li><Icons.Check /> 10 Secretos al día</li>
              <li><Icons.Check /> Cifrado XChaCha20</li>
              <li><Icons.Check /> Caducidad: 24 horas</li>
              <li className="disabled">❌ Dead Man Switch</li>
              <li className="disabled">❌ Anon Mail</li>
            </ul>
          </div>

          {/* TARJETA 2: PRO (DESTACADA) */}
          <div className="pricing-card featured">
            <div className="recommended-badge">Recomendado</div>
            <h3 className="plan-name">Agente</h3>
            <div className="price-tag">
              <span className="amount">€4.99</span>
              <span className="old-price">€9.00</span>
            </div>
            <p className="plan-desc">Privacidad total y herramientas activas.</p>
            <Link to="/register" className="btn-hero btn-full">Seleccionar Plan</Link>
            
            <ul className="feature-list">
              <li><Icons.Check /> <strong>Secretos Ilimitados</strong></li>
              <li><Icons.Check /> Caducidad: Hasta 30 días</li>
              <li><Icons.Check /> Dead Man Switch (1 activo)</li>
              <li><Icons.Check /> Anon Mail (5/día)</li>
              <li><Icons.Check /> Soporte Prioritario</li>
            </ul>
          </div>

          {/* TARJETA 3: EMPRESAS */}
          <div className="pricing-card">
            <h3 className="plan-name">Organización</h3>
            <div className="price-tag">
              <span className="amount">€19</span>
              <span className="period">/mes</span>
            </div>
            <p className="plan-desc">Para equipos de seguridad y periodistas.</p>
            <Link to="/register" className="btn-outline">Contactar Ventas</Link>
            
            <ul className="feature-list">
              <li><Icons.Check /> Todo lo de Agente</li>
              <li><Icons.Check /> Dead Man Switch Ilimitado</li>
              <li><Icons.Check /> Anon Mail Ilimitado</li>
              <li><Icons.Check /> Panel de Auditoría</li>
              <li><Icons.Check /> API Access</li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
}

export default Home;