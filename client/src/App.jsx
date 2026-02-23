import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Drop from './pages/Drop';
import Switch from './pages/Switch';
import Mail from './pages/Mail';
import Dashboard from './pages/Dashboard';
import Viewer from './pages/Viewer';
import Contact from './pages/Contact';
import { Toaster } from 'react-hot-toast';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from "@clerk/clerk-react";
import { dark } from '@clerk/themes';

function App() {
  const clerkAppearance = {
    baseTheme: dark,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#030a1c',
      colorText: 'white',
      borderRadius: '1rem',
    },
    elements: {
      card: "bg-slate-900/50 backdrop-blur-2xl border border-white/5 shadow-2xl",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase tracking-widest transition-all",
      footerActionLink: "text-blue-500 hover:text-blue-400",
      formFieldInput: "bg-black/40 border-white/10 text-white focus:border-blue-600",
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      <Toaster position="bottom-right" />
      
      <Routes>
        {/* --- RAÍZ RESTAURADA AL HOME ORIGINAL --- */}
        <Route path="/" element={<Home />} />
        
        {/* --- RUTAS DE LA APLICACIÓN --- */}
        <Route path="/drop" element={<SignedIn><Drop /></SignedIn>} />
        <Route path="/mail" element={<SignedIn><Mail /></SignedIn>} />
        <Route path="/dashboard" element={<SignedIn><Dashboard /></SignedIn>} />
        <Route path="/switch/*" element={<SignedIn><Switch /></SignedIn>} />

        {/* --- PROTECCIÓN DE RUTAS --- */}
        <Route path="/drop" element={<SignedOut><RedirectToSignIn /></SignedOut>} />
        <Route path="/mail" element={<SignedOut><RedirectToSignIn /></SignedOut>} />
        <Route path="/dashboard" element={<SignedOut><RedirectToSignIn /></SignedOut>} />

        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/d/:fileId" element={<Viewer />} />

        {/* --- AUTENTICACIÓN --- */}
        <Route 
          path="/sign-in/*" 
          element={
            <div className="flex items-center justify-center min-h-screen relative">
              <div className="absolute w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full z-0" />
              <div className="relative z-10">
                <SignIn routing="path" path="/sign-in" appearance={clerkAppearance} />
              </div>
            </div>
          } 
        />
        <Route 
          path="/sign-up/*" 
          element={
            <div className="flex items-center justify-center min-h-screen relative">
              <div className="absolute w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full z-0" />
              <div className="relative z-10">
                <SignUp routing="path" path="/sign-up" appearance={clerkAppearance} />
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;