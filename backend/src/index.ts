import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateUser } from './middleware/auth';
import { supabase } from './config/supabase';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('MindBloom Backend API is running');
});

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Protected Route Example
app.get('/api/test-auth', authenticateUser, (req: Request, res: Response) => {
    res.status(200).json({
        message: 'You are authenticated!',
        user: req.user
    });
});

// Example DB Route (Public for test, or protected)
app.get('/api/users-count', async (req: Request, res: Response) => {
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ count });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
