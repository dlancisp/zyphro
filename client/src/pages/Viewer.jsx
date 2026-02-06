import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify'; // Para limpiar HTML malicioso
import { cryptoUtils } from '../utils/crypto';
import { Icons } from '../components/Icons';

const API_URL = '/api';

function Viewer({ id, hash }) {
  const [status, setStatus] = useState('loading'); // loading, success, error, destroyed
  const [secretContent, setSecretContent] = useState('');
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchAndDecrypt = async () => {
      try {
        // 1. Pedimos el secreto cifrado al servidor
        const res = await fetch(`${API_URL}/secret/${id}`);
        
        if (res.status === 404 || res.status === 410) {
          setStatus('destroyed');
          return;
        }

        const data = await res.json();

        if (!data.cipherText) {
          throw new Error('Datos corruptos');
        }

        // 2. Intentamos descifrar con la clave de la URL (Hash)
        // El nuevo motor extraerá automáticamente el Salt y el Nonce del paquete
        try {
          const decrypted = await cryptoUtils.decryptData(data.cipherText, hash);
          // 3. Limpiamos el contenido para evitar XSS
          const clean = DOMPurify.sanitize(decrypted);
          setSecretContent(clean);
          setStatus('success');
          toast.success('Mensaje descifrado correctamente');
        } catch (decryptionError) {
          console.error(decryptionError);
          setStatus('error'); // Error de clave incorrecta
        }

      } catch (e) {
        console.error(e);
        setStatus('destroyed'); // Asumimos destruido si hay error de red o no existe
      }
    };

    fetchAndDecrypt();
  }, [id, hash]);

  if (status === 'loading') {
    return (
      <div className="main-content" style={{justifyContent:'center', alignItems:'center', minHeight:'60vh'}}>
        <div style={{textAlign:'center'}}>
          <div className="spinner" style={{fontSize:'2rem', marginBottom:'20px'}}>↻</div>
          <h2>Verificando integridad...</h2>
          <p>Descifrando paquete XChaCha20-Poly1305</p>
        </div>
      </div>
    );
  }

  if (status === 'destroyed' || status === 'error') {
    return (
      <div className="main-content" style={{justifyContent:'center'}}>
        <div className="feature-wrapper" style={{maxWidth:'600px', textAlign:'center', borderTop:'4px solid #ef4444'}}>
          <div style={{color:'#ef4444', marginBottom:'20px'}}><Icons.Shield /></div>
          <h2 className="section-title">Contenido no disponible</h2>
          <p className="section-desc">
            {status === 'error' 
              ? 'La clave de descifrado es incorrecta. ¿El enlace está cortado?' 
              : 'Este secreto ya ha sido leído y autodestruido, o ha expirado.'}
          </p>
          <a href="/" className="btn-hero" style={{marginTop:'20px', display:'inline-block', textDecoration:'none'}}>
            Crear un nuevo secreto
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{justifyContent:'center'}}>
      <div className="feature-wrapper" style={{maxWidth:'800px', borderTop:'4px solid var(--primary)'}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}>
           <div style={{color:'var(--primary)'}}><Icons.Check /></div>
           <h2 className="section-title" style={{margin:0}}>Mensaje Seguro</h2>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)', 
          padding: '30px', 
          borderRadius: '8px', 
          whiteSpace: 'pre-wrap', 
          textAlign: 'left',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          border: '1px solid var(--border-color)',
          fontFamily: 'monospace' // Fuente monoespaciada para claves/código
        }}>
          {secretContent}
        </div>

        <div style={{marginTop:'30px', textAlign:'center', borderTop:'1px solid var(--border-color)', paddingTop:'20px'}}>
          <p style={{color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'20px'}}>
            🔥 Este mensaje se ha autodestruido del servidor. Si recargas la página, desaparecerá.
          </p>
          <button className="btn-hero" onClick={() => window.location.href = '/'} style={{background:'transparent', border:'1px solid var(--border-color)', color:'var(--text-heading)'}}>
            Enviar mi propio secreto
          </button>
        </div>
      </div>
    </div>
  );
}

export default Viewer;