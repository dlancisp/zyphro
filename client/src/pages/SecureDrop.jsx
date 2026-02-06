import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { cryptoUtils } from '../utils/crypto';
import { Icons } from '../components/Icons';

const API_URL = '/api';

function SecureDrop() {
  const [state, setState] = useState({ text: '', link: '', loading: false });

  const create = async () => {
    if (!state.text) { 
      toast.error('Por favor, escribe un secreto.'); 
      return; 
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      // 1. Generamos la clave (Ahora es una frase/hash seguro compatible con PBKDF2)
      const keyStr = await cryptoUtils.generateKey();
      
      // 2. Encriptamos usando XChaCha20-Poly1305 (Salts y Nonces se manejan internamente)
      const encrypted = await cryptoUtils.encryptData(state.text, keyStr);

      // 3. Enviamos SOLO el texto cifrado al servidor
      const res = await fetch(`${API_URL}/secret`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ cipherText: encrypted }) 
      });

      if (!res.ok) throw new Error('Error en servidor');
      
      const data = await res.json();
      
      // 4. Construimos el enlace con la clave en el Hash (nunca viaja al servidor)
      const fullLink = `${window.location.origin}/?id=${data.id}#${keyStr}`;
      
      setState({ text: '', loading: false, link: fullLink });
      toast.success('¡Secreto blindado con XChaCha20!');

    } catch (e) { 
      console.error(e);
      toast.error('Error al encriptar. Revisa la consola.'); 
      setState(prev => ({ ...prev, loading: false })); 
    }
  };

  return (
    <div className="feature-wrapper">
      <div style={{marginBottom:'30px'}}>
        <h2 className="section-title">Secure Drop <span style={{fontSize:'0.8em', color:'var(--primary)', background:'#eff6ff', padding:'2px 8px', borderRadius:'12px'}}>XChaCha20</span></h2>
        <p className="section-desc">Cifrado de grado militar. Tus datos nunca tocan el servidor sin cifrar.</p>
      </div>
      
      {!state.link ? (
        <>
          <div className="input-group">
            <label className="input-label">CONTENIDO TOP SECRET</label>
            <textarea 
              placeholder="Escribe contraseñas, claves privadas o mensajes confidenciales..." 
              value={state.text} 
              onChange={e => setState({...state, text: e.target.value})} 
              style={{minHeight: '120px'}}
            />
          </div>
          <button className="btn-hero" style={{width:'100%'}} onClick={create} disabled={state.loading}>
            {state.loading ? (
              <span><span className="spinner">↻</span> Blindando...</span>
            ) : (
              'Encriptar y Generar Enlace Seguro'
            )}
          </button>
        </>
      ) : (
        <div className="feature-wrapper" style={{boxShadow:'none', border:'none', padding:0, marginTop:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:'600', color:'var(--primary)', fontSize:'1.1rem', marginBottom: '15px'}}>
            <Icons.Check /><span>Enlace Seguro Listo</span>
          </div>
          
          <div className="result-link" onClick={() => { navigator.clipboard.writeText(state.link); toast.success('Copiado'); }}>
            {state.link}
          </div>
          
          <div style={{display:'flex', gap:'15px', marginTop: '15px'}}>
            <button className="btn-hero" style={{flex:1}} onClick={() => { navigator.clipboard.writeText(state.link); toast.success('¡Enlace copiado!'); }}>
              Copiar Enlace
            </button>
            <button className="btn-hero" style={{background:'var(--bg-secondary)', color:'var(--text-heading)', border:'1px solid var(--border-color)'}} onClick={() => setState({text:'', link:'', loading:false})}>
              Crear Nuevo
            </button>
          </div>
          <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'15px'}}>
            ⚠️ Este enlace funciona <strong>una sola vez</strong>. Al abrirlo, el secreto se borrará para siempre.
          </p>
        </div>
      )}
    </div>
  );
}

export default SecureDrop;