import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

      // ¡Éxito!
      setStatus({ loading: false, error: '', success: true });
      
      // Guardamos una marca simple en localStorage para saber que estamos logueados
      // (La seguridad real está en la cookie HTTP-Only que envió el servidor)
      localStorage.setItem('zyphro_user', JSON.stringify(data.user));

      // Redirigir al usuario al panel principal tras 1 segundo
      setTimeout(() => navigate('/'), 1000);

    } catch (err) {
      setStatus({ loading: false, error: err.message, success: false });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Iniciar Sesión
        </h2>

        {status.error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded text-sm text-center">
            {status.error}
          </div>
        )}

        {status.success && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-800 text-green-200 rounded text-sm text-center">
            ¡Bienvenido de nuevo! Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.loading ? 'Entrando...' : 'Acceder'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-500 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;