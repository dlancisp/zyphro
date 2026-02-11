import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Drop from './pages/Drop';     // Antes SecureDrop
import Switch from './pages/Switch'; // Antes DeadMansSwitch
import Mail from './pages/Mail';     // Antes AnonymousMail
import Dashboard from './pages/Dashboard';
import Viewer from './pages/Viewer'; // Para ver archivos recibidos
import { Toaster } from 'react-hot-toast';

// Clerk
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Navbar />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      <Routes>
        {/* RUTAS PÚBLICAS (El Gancho) */}
        <Route path="/" element={<Home />} />
        <Route path="/drop" element={<Drop />} />
        <Route path="/mail" element={<Mail />} />
        
        {/* RUTA DE DESCARGA (Pública pero con clave en URL) */}
        <Route path="/d/:fileId" element={<Viewer />} />

        {/* RUTAS PRIVADAS (Requieren Login) */}
        <Route
          path="/switch/*"
          element={
            <>
              <SignedIn><Switch /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn><Dashboard /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;