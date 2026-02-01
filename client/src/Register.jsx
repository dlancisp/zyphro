import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Para navegar tras el registro

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Detectar URL correcta (Local o Nube)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // <--- ¡LA CLAVE! Permite recibir la Cookie Segura
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Si todo va bien, redirigimos al usuario (por ahora a la home)
      alert('¡Cuenta creada con éxito!');
      navigate('/'); 

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Crear Cuenta en ZYPH</h2>
      <p style={{ color: '#888' }}>Únete para gestionar tus secretos.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white' }}
        />
        
        <input
          type="password"
          placeholder="Contraseña segura"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: 'white' }}
        />

        {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

        <button type="submit" style={{ padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Registrarse
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#0070f3' }}>Inicia sesión</Link>
      </p>
    </div>
  );
}