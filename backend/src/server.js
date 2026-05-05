import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Configurar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

// Inicializar app
const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por windowMs
});
app.use('/api/', limiter);

// Rotas
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import kbRoutes from './routes/kbRoutes.js';
import boletoRoutes from './routes/boletoRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import assetHistoryRoutes from './routes/assetHistoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/boletos', boletoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', assetHistoryRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Servidor rodando em http://${HOST}:${PORT}       ║
║   📊 Ambiente: ${process.env.NODE_ENV || 'development'}                      ║
║   🗄️  Banco de dados: MongoDB                         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});
