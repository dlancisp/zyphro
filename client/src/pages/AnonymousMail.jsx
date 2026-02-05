import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Icons } from '../components/Icons';

const API_URL = '/api';

function AnonymousMail() {
  const [form, setForm] = useState({ to: '', sub: '', body: '' });
  const [loading, setLoading] = useState(false);
  const send = async () => {
    if(!form.to || !form.body) return toast.error("Faltan datos");
    setLoading(true);
    try { await fetch(`${API_URL}/email`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ to: form.to, subject: form.sub, message: form.body }) }); toast.success('Enviado'); setForm({ to: '', sub: '', body: '' }); } catch(e) { toast.error("Error"); } setLoading(false);
  };
  return (
    <div className="feature-wrapper">
      <div style={{marginBottom:'30px'}}><h2 className="section-title">Anon Mail</h2><p className="section-desc">Envía correos anónimos.</p></div>
      <div className="input-group"><label className="input-label">PARA</label><input value={form.to} onChange={e => setForm({...form, to: e.target.value})} /></div>
      <div className="input-group"><label className="input-label">ASUNTO</label><input value={form.sub} onChange={e => setForm({...form, sub: e.target.value})} /></div>
      <div className="input-group"><label className="input-label">MENSAJE</label><textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} /></div>
      <button className="btn-hero" onClick={send} disabled={loading} style={{width:'100%'}}><Icons.Send /><span style={{marginLeft:'8px'}}>{loading ? 'Enviando...' : 'Enviar'}</span></button>
    </div>
  );
}

export default AnonymousMail;