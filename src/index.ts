import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardRoutes from './routes/board.routes.js';
import advisoryRoutes from './routes/advisory.routes.js';
import eventRoutes from './routes/event.routes.js';
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Club Backend API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/board-members', boardRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
