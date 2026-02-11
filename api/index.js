import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Necesario para Socket.io
import { Server } from 'socket.io';  // La librería que acabamos de instalar

// Tus rutas actuales (asegúrate de que los archivos existen en /routes)
import authRoutes from './routes/auth.js';
// import dropRoutes from './routes/storage.js'; // Descomenta cuando renombres vault.js a storage.js
// import switchRoutes from './routes/switch.js'; // Descomenta cuando renombres dms.js a switch.js
// import cronRoutes from './routes/cron.js';    // Descomenta si tienes cron.js

dotenv.config();

const app = express();

// 1. Creamos el servidor HTTP explícitamente para unir Express + Socket.io
const httpServer = createServer(app);

// 2. Configuramos Socket.io (El cerebro del P2P)
const io = new Server(httpServer, {
  cors: { 
    origin: "*", // En producción esto deberá ser tu dominio real (zyphro.net)
    methods: ["GET", "POST"] 
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(morgan('dev'));

// 3. Lógica de Señalización P2P (Esto conecta a Alice con Bob)
io.on('connection', (socket) => {
  console.log('🔗 Usuario conectado al Socket:', socket.id);
  
  // Cuando alguien quiere iniciar una llamada P2P
  socket.on('callUser', (data) => {
    io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from });
  });

  // Cuando el otro responde
  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Rutas API REST normales
app.use('/api/auth', authRoutes);
// app.use('/api/drop', dropRoutes);
// app.use('/api/switch', switchRoutes);
// app.use('/api/cron', cronRoutes);

const PORT = process.env.PORT || 3000;

// IMPORTANTE: Usamos httpServer.listen en vez de app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Zyphro API + Sockets corriendo en puerto ${PORT}`);
});