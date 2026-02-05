import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { cryptoUtils } from '../utils/crypto';
import { Icons } from '../components/Icons';

const API_URL = '/api';

function SecureDrop() {
  const [state, setState] = useState({ text: '', link: '', loading: false });

  const create = async () => {
    if (!state.text) { toast.error('Por favor, escribe un secreto.'); return; }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const keyStr = await cryptoUtils.generateKey();
      const encrypted = await cryptoUtils.encryptData(state.text, keyStr);
      const res = await fetch(`${API_URL}/secret`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cipherText: encrypted }) });
      if (!res.ok) throw new Error('Error en servidor');
      const data = await res.json();
      setState({ text: '', loading: false, link: `${window.location.origin}/?id=${data.id}#${keyStr}` });
      toast.success('¡Secreto encriptado correctamente!');
    } catch (e) { 
      toast.error('Error de encriptación o conexión'); setState(prev => ({ ...prev, loading: false })); 
    }
  };

  return (
    <div className="feature-wrapper">
      <div style={{marginBottom:'30px'}}>
        <h2 className="section-title">Secure Drop</h2>
        <p className="section-desc">Cifrado AES-256-GCM de extremo a extremo.</p>
      </div>
      {!state.link ? (
        <>
          <div className="input-group">
            <label className="input-label">CONTENIDO PRIVADO</label>
            <textarea placeholder="Escribe aquí tu secreto..." value={state.text} onChange={e => setState({...state, text: e.target.value})} />
          </div>
          <button className="btn-hero" style={{width:'100%'}} onClick={create} disabled={state.loading}>
            {state.loading ? 'Encriptando...' : 'Encriptar y Generar Enlace'}
          </button>
        </>
      ) : (
        <div className="feature-wrapper" style={{boxShadow:'none', border:'none', padding:0, marginTop:0}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:'600', color:'var(--primary)', fontSize:'1.1rem', marginBottom: '15px'}}>
            <Icons.Check /><span>Enlace Seguro Generado</span>
          </div>
          <div className="result-link">{state.link}</div>
          <div style={{display:'flex', gap:'15px', marginTop: '15px'}}>
            <button className="btn-hero" style={{flex:1}} onClick={() => { navigator.clipboard.writeText(state.link); toast.success('¡Enlace copiado!'); }}>Copiar</button>
            <button className="btn-hero" style={{background:'var(--bg-secondary)', color:'var(--text-heading)', border:'1px solid var(--border-color)'}} onClick={() => setState({text:'', link:'', loading:false})}>Nuevo</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecureDrop;