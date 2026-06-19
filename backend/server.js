const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'profinance_super_secret_key_change_me';

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here'
);

app.use(cors());
app.use(express.json());

// Initialize database tables (skip for now - create in Supabase dashboard)
console.log('Connected to Supabase database');

/* Root Health Check Route */
app.get('/', (req, res) => {
  res.json({ message: 'ProFinance API Server', status: 'online', port: PORT });
});

/* Security Token Verification Middleware */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) return res.status(403).json({ error: "Session expired." });
    req.user = userPayload;
    next();
  });
}

/* Authentication Routes */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All profile fields are mandatory." });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'u_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Insert new user
    const { error: userError } = await supabase
      .from('users')
      .insert([{ id: userId, name, email, password: hashedPassword, createdAt: now }]);

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    // Insert default settings
    await supabase
      .from('settings')
      .insert([{ userId, currency: 'USD', weekStart: 0 }]);

    const token = jwt.sign({ id: userId, email, name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { name, email } });
  } catch (e) {
    res.status(500).json({ error: "Server structural processing error." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Invalid email or credentials." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: "Login error." });
  }
});

/* Protected Hydration State Route */
app.get('/api/state', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Generate recurring template instances first
    await generateRecurringInstances(userId);

    const state = {
      user: { name: req.user.name, email: req.user.email },
      settings: { currency: "USD", weekStart: 0 },
      todos: [],
      recurringTemplates: [],
      income: [],
      expenses: [],
      savings: [],
      events: []
    };

    // Fetch settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('userId', userId)
      .single();

    if (settings) {
      state.settings = { currency: settings.currency, weekStart: settings.weekStart };
    }

    // Fetch all data in parallel
    const [
      { data: todos },
      { data: templates },
      { data: income },
      { data: expenses },
      { data: savings },
      { data: events }
    ] = await Promise.all([
      supabase.from('todos').select('*').eq('userId', userId).order('date', { ascending: false }).order('startTime', { ascending: false }),
      supabase.from('recurring_templates').select('*').eq('userId', userId),
      supabase.from('income').select('*').eq('userId', userId).order('date', { ascending: false }),
      supabase.from('expenses').select('*').eq('userId', userId).order('date', { ascending: false }),
      supabase.from('savings').select('*').eq('userId', userId).order('date', { ascending: false }),
      supabase.from('events').select('*').eq('userId', userId).order('date', { ascending: false }).order('time', { ascending: false })
    ]);

    if (todos) state.todos = todos.map(t => ({ ...t, timerRunning: !!t.timerRunning, archived: !!t.archived }));
    if (templates) state.recurringTemplates = templates.map(tpl => ({ ...tpl, active: !!tpl.active, daysOfWeek: JSON.parse(tpl.daysOfWeek || '[]') }));
    if (income) state.income = income;
    if (expenses) state.expenses = expenses;
    if (savings) state.savings = savings;
    if (events) state.events = events;

    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Generate recurring template instances for a 4-week rolling window */
async function generateRecurringInstances(userId) {
  try {
    const { data: templates } = await supabase
      .from('recurring_templates')
      .select('*')
      .eq('userId', userId)
      .eq('active', 1);

    if (!templates || templates.length === 0) return;

    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

    for (const template of templates) {
      const daysOfWeek = JSON.parse(template.daysOfWeek || '[]');
      if (!daysOfWeek || daysOfWeek.length === 0) continue;

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (daysOfWeek.includes(d.getDay())) {
          const instanceDate = d.toISOString().split('T')[0];
          const existingId = `${template.id}_${instanceDate}`;

          // Check if instance exists
          const { data: existing } = await supabase
            .from('todos')
            .select('id')
            .eq('id', existingId)
            .single();

          if (!existing) {
            await supabase.from('todos').insert([{
              id: existingId,
              userId,
              templateId: template.id,
              instanceDate,
              title: template.title,
              description: template.description,
              category: template.category,
              priority: template.priority,
              date: instanceDate,
              startTime: template.startTime,
              endTime: template.endTime,
              status: 'Open',
              createdAt: new Date().toISOString()
            }]);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating recurring instances:', error.message);
  }
}

/* Settings Update Route */
app.patch('/api/settings', authenticateToken, async (req, res) => {
  const { currency, weekStart } = req.body;
  const userId = req.user.id;

  try {
    const updateData = {};
    if (currency) updateData.currency = currency;
    if (weekStart !== undefined) updateData.weekStart = weekStart;

    const { error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('userId', userId);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ success: true, currency: currency || 'USD', weekStart: weekStart !== undefined ? weekStart : 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Backend Analytic Calculations Route */
app.get('/api/reports/analytics', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const report = { monthlyTrend: [], expenseByCategory: [], incomeByCategory: [], savingsProgress: [] };

    // Get 6 months of data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      { data: incomeData },
      { data: expenseData },
      { data: savingsData }
    ] = await Promise.all([
      supabase.from('income').select('*').eq('userId', userId).gte('date', sixMonthsAgo.toISOString().split('T')[0]),
      supabase.from('expenses').select('*').eq('userId', userId).gte('date', sixMonthsAgo.toISOString().split('T')[0]),
      supabase.from('savings').select('*').eq('userId', userId)
    ]);

    // Process monthly trend
    const monthMap = {};
    if (incomeData) {
      incomeData.forEach(item => {
        const month = item.date.substring(0, 7);
        monthMap[month] = monthMap[month] || { Income: 0, Expense: 0 };
        monthMap[month].Income += item.amount || 0;
      });
    }
    if (expenseData) {
      expenseData.forEach(item => {
        const month = item.date.substring(0, 7);
        monthMap[month] = monthMap[month] || { Income: 0, Expense: 0 };
        monthMap[month].Expense += item.amount || 0;
      });
    }
    report.monthlyTrend = Object.keys(monthMap).sort().map(month => ({ name: month, ...monthMap[month] }));

    // Process categories
    if (expenseData) {
      const expenseMap = {};
      expenseData.forEach(item => {
        expenseMap[item.category] = (expenseMap[item.category] || 0) + (item.amount || 0);
      });
      report.expenseByCategory = Object.keys(expenseMap).map(cat => ({ name: cat, value: expenseMap[cat] }));
    }

    if (incomeData) {
      const incomeMap = {};
      incomeData.forEach(item => {
        incomeMap[item.category] = (incomeMap[item.category] || 0) + (item.amount || 0);
      });
      report.incomeByCategory = Object.keys(incomeMap).map(cat => ({ name: cat, value: incomeMap[cat] }));
    }

    if (savingsData) {
      report.savingsProgress = savingsData.map(s => ({ name: s.goal, current: s.amount || 0, target: s.targetAmount || 0 }));
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Timer Control Routes */
app.post('/api/todos/:id/start-timer', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('todos')
      .update({ timerRunning: 1, actualStartTime: now, status: 'In Progress' })
      .eq('id', id)
      .eq('userId', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, timerRunning: true, actualStartTime: now });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/todos/:id/stop-timer', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('todos')
      .update({ timerRunning: 0, actualEndTime: now, status: 'Completed', completedDate: now })
      .eq('id', id)
      .eq('userId', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, timerRunning: false, actualEndTime: now, status: 'Completed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/todos/:id/pause-timer', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { error } = await supabase
      .from('todos')
      .update({ timerRunning: 0, status: 'In Progress' })
      .eq('id', id)
      .eq('userId', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, timerRunning: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* Protected CRUD Route Builder */
function buildProtectedRoutes(tableName, routeName) {
  app.post(`/api/${routeName}`, authenticateToken, async (req, res) => {
    const item = req.body;
    item.userId = req.user.id;

    try {
      // Convert booleans to integers if needed
      const data = Object.keys(item).reduce((acc, key) => {
        acc[key] = typeof item[key] === 'object' && !Array.isArray(item[key]) 
          ? JSON.stringify(item[key]) 
          : item[key];
        return acc;
      }, {});

      const { error } = await supabase
        .from(tableName)
        .upsert([data], { onConflict: 'id' });

      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true, id: item.id });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete(`/api/${routeName}/:id`, authenticateToken, async (req, res) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', req.params.id)
        .eq('userId', req.user.id);

      if (error) return res.status(500).json({ error: error.message });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

buildProtectedRoutes('todos', 'todos');
buildProtectedRoutes('recurring_templates', 'templates');
buildProtectedRoutes('income', 'income');
buildProtectedRoutes('expenses', 'expenses');
buildProtectedRoutes('savings', 'savings');
buildProtectedRoutes('events', 'events');

app.listen(PORT, () => console.log(`ProFinance Fullstack Server online on port ${PORT}`));
