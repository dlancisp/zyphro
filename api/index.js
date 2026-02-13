import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import path from 'path';
import { fileURLToPath } from 'url';

// Rutas (Asegúrate de tener estos archivos creados o déjalos comentados)
import authRoutes from './routes/auth.js';
// import dropRoutes from './routes/storage.js'; 
// import switchRoutes from './routes/switch.js'; 

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configuración de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Socket.io con configuración adaptable
const io = new Server(httpServer, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(morgan('dev'));

// Lógica de Señalización P2P
io.on('connection', (socket) => {
  console.log('🔗 Usuario conectado:', socket.id);
  
  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

// Rutas API
app.use('/api/auth', authRoutes);

// --- 🌍 CONFIGURACIÓN PARA DESPLIEGUE (PRODUCCIÓN) ---
// Si estamos en producción, servimos el Frontend compilado
if (process.env.NODE_ENV === 'production') {
  // Apuntamos a la carpeta 'dist' que genera Vite al compilar
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Cualquier ruta que no sea de la API, carga el index.html del cliente
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Zyphro Online en puerto ${PORT}`);
});