import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const AutoCheckIn = () => {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    // Si el usuario ya cargó y existe (está logueado)
    if (isLoaded && userId) {
      
      const reportLife = async () => {
        try {
          console.log("💓 Enviando señal de vida al Dead Man Switch...");
          
          await fetch('/api/dms/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }) // Enviamos el ID para que el servidor sepa quién es
          });
          
          console.log("✅ Check-in realizado con éxito.");
        } catch (error) {
          console.error("❌ Error en auto-checkin:", error);
        }
      };

      reportLife();
    }
  }, [isLoaded, userId]); // Se ejecuta automáticamente al detectar el usuario

  return null; // NO renderiza nada visual, es un proceso de fondo
};

export default AutoCheckIn;