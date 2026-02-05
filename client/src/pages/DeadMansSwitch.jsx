import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Icons } from '../components/Icons';

const API_URL = '/api';

function DeadMansSwitch() {
  const [active, setActive] = useState(false);
  const [form, setForm] = useState({ to: '', msg: '', time: 1 });
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  const activate = async () => {
    if(!form.to || !form.msg) return toast.error("Rellena todos los campos");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/switch/create`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ recipientEmail: form.to, encryptedContent: form.msg, checkInFrequency: form.time }) });
      const data = await res.json(); setActiveId(data.id); setActive(true); toast.success('Protocolo activado.');
    } catch(e) { toast.error("Error al conectar"); } setLoading(false);
  };
  const checkIn = async () => { await fetch(`${API_URL}/switch/checkin`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: activeId }) }); toast.success('Vida confirmada.'); };

  return (
    <div className="feature-wrapper">
      <div style={{marginBottom:'30px'}}><h2 className="section-title">Dead Man's Switch</h2><p className="section-desc">Si no das señales de vida, enviamos el mensaje.</p></div>
      {!active ? (
        <>
          <div className="input-group"><label className="input-label">DESTINATARIO</label><input type="email" value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">MENSAJE</label><textarea value={form.msg} onChange={e => setForm({...form, msg: e.target.value})} /></div>
          <div className="input-group"><label className="input-label">TIEMPO (MINUTOS)</label><input type="number" min="1" value={form.time} onChange={e => setForm({...form, time: e.target.value})} /></div>
          <button className="btn-hero" onClick={activate} disabled={loading} style={{background:'#dc2626', width:'100%'}}>{loading ? 'Activando...' : 'Activar Protocolo'}</button>
        </>
      ) : (
        <div style={{textAlign:'center'}}><div style={{color:'#dc2626', marginBottom:'15px'}}><Icons.Shield /></div><h3>Monitoreo Activo</h3><p>Confirma vida cada {form.time} min.</p><button className="btn-hero" onClick={checkIn} style={{background:'#16a34a'}}>Confirmar Vida</button></div>
      )}
    </div>
  );
}

export default DeadMansSwitch;