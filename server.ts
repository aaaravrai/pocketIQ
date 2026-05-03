import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Mock Data Store
  let transactions = [
    { id: '1', amount: 84.20, category: 'Study', type: 'expense', description: 'Campus Bookstore', date: new Date().toISOString() },
    { id: '2', amount: 6.50, category: 'Food', type: 'expense', description: 'Student Canteen', date: new Date().toISOString() },
    { id: '3', amount: 250.00, category: 'Income', type: 'earning', description: 'Allowance Credit', date: new Date(Date.now() - 86400000).toISOString() },
    { id: '4', amount: 2.75, category: 'Transport', type: 'expense', description: 'City Transit', date: new Date(Date.now() - 86400000).toISOString() },
  ];

  let goals = [
    { id: '1', title: 'Laptop Fund', targetAmount: 1200, currentAmount: 850, icon: 'rocket_launch', color: '#3b82f6' },
    { id: '2', title: 'New Headphones', targetAmount: 400, currentAmount: 260, icon: 'headphones', color: '#3b82f6' },
    { id: '3', title: 'Summer Trip', targetAmount: 1500, currentAmount: 480, icon: 'flight', color: '#4edea3' },
  ];

  let profile = {
    name: 'Aarav Rai',
    email: 'aaravrai.webnet@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
    totalBalance: 2845.50,
    monthlyAllowance: 1200,
  };

  // API Routes
  app.get('/api/transactions', (req, res) => res.json(transactions));
  app.post('/api/transactions', (req, res) => {
    const newTx = { ...req.body, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
    transactions = [newTx, ...transactions];
    
    // Update balance
    if (newTx.type === 'expense') profile.totalBalance -= newTx.amount;
    else profile.totalBalance += newTx.amount;
    
    res.status(201).json(newTx);
  });

  app.get('/api/goals', (req, res) => res.json(goals));
  app.post('/api/goals/:id', (req, res) => {
    const { id } = req.params;
    const update = req.body;
    goals = goals.map(g => g.id === id ? { ...g, ...update } : g);
    res.json(goals.find(g => g.id === id));
  });
  app.get('/api/profile', (req, res) => res.json(profile));

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PocketIQ Server listening on port ${PORT}`);
  });
}

startServer();
