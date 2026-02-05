import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { cryptoUtils } from '../utils/crypto';

const API_URL = '/api';

function Viewer({ id, hash }) {
  const [msg, setMsg] = useState('Verificando integridad...');
  const fetched = useRef(false);

  useEffect(() => {
    if(fetched.current) return; 
    fetched.current = true;
    
    fetch(`${API_URL}/secret/${id}`)
      .then(r => r.status === 404 ? 'exp' : r.json())
      .then(async (d) => {
        if(d === 'exp') {
          setMsg('⛔ Este mensaje ha sido destruido o no existe.');
          toast.error('Mensaje no encontrado');
        } else if(d?.cipherText) {
          try { 
            const decrypted = await cryptoUtils.decryptData(d.cipherText, hash);
            const cleanMessage = DOMPurify.sanitize(decrypted); 
            setMsg(cleanMessage); 
            toast.success('Mensaje descifrado correctamente');
          } catch (e) { 
            setMsg('❌ Error: La llave de desencriptado es incorrecta.'); 
            toast.error('Llave incorrecta');
          }
        }
      })
      .catch(() => {
          setMsg('Error de conexión con el servidor.');
          toast.error('Error de conexión');
      });
  }, [id, hash]);

  return (
    <div className="main-content" style={{justifyContent:'center'}}>
      <div className="feature-wrapper" style={{maxWidth:'700px'}}>
        <h2 className="section-title" style={{marginBottom:'30px'}}>Mensaje Seguro Recibido</h2>
        <div style={{background:'var(--bg-secondary)', padding:'30px', borderRadius:'12px', whiteSpace:'pre-wrap', textAlign:'left', borderLeft: '5px solid var(--primary)', fontSize:'1.1rem', color:'var(--text-heading)'}}>
          {msg}
        </div>
        
        <a href="/" style={{display:'block', marginTop:'40px', color:'var(--primary)', textDecoration:'none', fontWeight:'700', fontSize:'1.1rem'}}>
          ← Crear mi propio secreto en ZYPHRO
        </a>
      </div>
    </div>
  );
}

export default Viewer;