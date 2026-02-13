import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Drop from './pages/Drop';
import Switch from './pages/Switch';
import Mail from './pages/Mail';
import Dashboard from './pages/Dashboard';
import Viewer from './pages/Viewer';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
      
      <Routes>
        {/* RUTAS CON NAVBAR (EL LOGO DE SIEMPRE) */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/drop" element={<><Navbar /><Drop /></>} />
        <Route path="/mail" element={<><Navbar /><Mail /></>} />
        <Route path="/d/:fileId" element={<><Navbar /><Viewer /></>} />

        {/* RUTA DASHBOARD (SIN NAVBAR GLOBAL - USARÁ EL LOGO NUEVO) */}
        <Route
          path="/dashboard"
          element={
            <>
              <SignedIn><Dashboard /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />

        <Route
          path="/switch/*"
          element={
            <>
              <SignedIn><Navbar /><Switch /></SignedIn>
              <SignedOut><RedirectToSignIn /></SignedOut>
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;