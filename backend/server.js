const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'profinance_super_secret_key_change_me';

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'profinance.db');
const db = new sqlite3.Database(dbPath);

// Create tables securely with user authorization models
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS settings (
    userId TEXT PRIMARY KEY,
    currency TEXT DEFAULT 'USD',
    weekStart INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    templateId TEXT,
    instanceDate TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    date TEXT,
    dueDate TEXT,
    startTime TEXT,
    endTime TEXT,
    actualStartTime TEXT,
    actualEndTime TEXT,
    timerRunning INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Open',
    completedDate TEXT,
    archived INTEGER DEFAULT 0,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS recurring_templates (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT,
    daysOfWeek TEXT,
    startTime TEXT,
    endTime TEXT,
    active INTEGER DEFAULT 1,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`);

  ['income', 'expenses', 'savings'].forEach(table => {
    let extraFields = table === 'savings' ? 'goal TEXT, targetAmount REAL, amount REAL,' : 'merchant TEXT, amount REAL,';
    if (table === 'income') extraFields = 'source TEXT, amount REAL,';

    db.run(`CREATE TABLE IF NOT EXISTS ${table} (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      category TEXT,
      date TEXT,
      notes TEXT,
      ${extraFields}
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);
  });

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    time TEXT,
    category TEXT,
    recurring INTEGER DEFAULT 0,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
  )`);
});

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

    db.run(
      `INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, ?)`,

      [userId, name, email, hashedPassword, now],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Email already registered." });
          return res.status(500).json({ error: err.message });
        }
        db.run(`INSERT INTO settings (userId, currency, weekStart) VALUES (?, 'USD', 0)`, [userId]);
        const token = jwt.sign({ id: userId, email, name }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { name, email } });
      }
    );
  } catch (e) {
    res.status(500).json({ error: "Server structural processing error." });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: "Invalid email or credentials." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  });
});

/* Protected Hydration State Route */
app.get('/api/state', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // Auto-generate recurring template instances on state fetch
  generateRecurringInstances(userId, () => {
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

    db.get("SELECT * FROM settings WHERE userId = ?", [userId], (err, settingsRow) => {
      if (!err && settingsRow) {
        state.settings = { currency: settingsRow.currency, weekStart: settingsRow.weekStart };
      }
      db.all("SELECT * FROM todos WHERE userId = ? ORDER BY date DESC, startTime DESC", [userId], (err, todos) => {
        if (!err) state.todos = todos.map(t => ({ ...t, timerRunning: !!t.timerRunning, archived: !!t.archived }));
        db.all("SELECT * FROM recurring_templates WHERE userId = ?", [userId], (err, templates) => {
          if (!err) state.recurringTemplates = templates.map(tpl => ({ ...tpl, active: !!tpl.active, daysOfWeek: JSON.parse(tpl.daysOfWeek || '[]') }));
          db.all("SELECT * FROM income WHERE userId = ? ORDER BY date DESC", [userId], (err, income) => {
            if (!err) state.income = income;
            db.all("SELECT * FROM expenses WHERE userId = ? ORDER BY date DESC", [userId], (err, expenses) => {
              if (!err) state.expenses = expenses;
              db.all("SELECT * FROM savings WHERE userId = ? ORDER BY date DESC", [userId], (err, savings) => {
                if (!err) state.savings = savings;
                db.all("SELECT * FROM events WHERE userId = ? ORDER BY date DESC, time DESC", [userId], (err, events) => {
                  if (!err) state.events = events;
                  res.json(state);
                });
              });
            });
          });
        });
      });
    });
  });
});

/* Generate recurring template instances for a 4-week rolling window */
function generateRecurringInstances(userId, callback) {
  db.all("SELECT * FROM recurring_templates WHERE userId = ? AND active = 1", [userId], (err, templates) => {
    if (err || !templates || templates.length === 0) return callback();

    const now = new Date();
    const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week past
    const endDate = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000); // 4 weeks ahead
    let processed = 0;

    templates.forEach(template => {
      const daysOfWeek = JSON.parse(template.daysOfWeek || '[]');
      if (!daysOfWeek || daysOfWeek.length === 0) {
        processed++;
        if (processed === templates.length) callback();
        return;
      }

      // Generate instances for each day of week in the window
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (daysOfWeek.includes(d.getDay())) {
          const instanceDate = d.toISOString().split('T')[0];
          const existingId = `${template.id}_${instanceDate}`;

          // Check if instance already exists
          db.get("SELECT id FROM todos WHERE id = ?", [existingId], (err, row) => {
            if (!row && !err) {
              // Create new instance
              db.run(
                `INSERT INTO todos (id, userId, templateId, instanceDate, title, description, category, priority, date, startTime, endTime, status, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?)`,
                [existingId, userId, template.id, instanceDate, template.title, template.description, template.category, template.priority, instanceDate, template.startTime, template.endTime, new Date().toISOString()]
              );
            }
          });
        }
      }
      processed++;
      if (processed === templates.length) setTimeout(callback, 100);
    });
  });
}

/* Settings Update Route */
app.patch('/api/settings', authenticateToken, (req, res) => {
  const { currency, weekStart } = req.body;
  const userId = req.user.id;
  
  db.run(
    `UPDATE settings SET currency = COALESCE(?, currency), weekStart = COALESCE(?, weekStart) WHERE userId = ?`,
    [currency || null, weekStart !== undefined ? weekStart : null, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, currency: currency || 'USD', weekStart: weekStart !== undefined ? weekStart : 0 });
    }
  );
});

/* Backend Analytic Calculations Route */
app.get('/api/reports/analytics', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const report = { monthlyTrend: [], expenseByCategory: [], incomeByCategory: [], savingsProgress: [] };

  const trendQuery = `
    SELECT strftime('%Y-%m', date) as month,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
    FROM (
      SELECT 'income' as type, amount, date FROM income WHERE userId = ?
      UNION ALL
      SELECT 'expense' as type, amount, date FROM expenses WHERE userId = ?
    )
    WHERE date >= date('now', '-6 months')
    GROUP BY month ORDER BY month ASC
  `;

  db.all(trendQuery, [userId, userId], (err, trendRows) => {
    if (!err && trendRows) {
      report.monthlyTrend = trendRows.map(row => ({ name: row.month, Income: row.income ?? 0, Expense: row.expense ?? 0 }));
    }
    db.all(`SELECT category as name, SUM(amount) as value FROM expenses WHERE userId = ? GROUP BY category`, [userId], (err, expRows) => {
      if (!err && expRows) report.expenseByCategory = expRows;
      db.all(`SELECT category as name, SUM(amount) as value FROM income WHERE userId = ? GROUP BY category`, [userId], (err, incRows) => {
        if (!err && incRows) report.incomeByCategory = incRows;
        db.all("SELECT goal as name, amount as current, targetAmount as target FROM savings WHERE userId = ?", [userId], (err, savRows) => {
          if (!err && savRows) report.savingsProgress = savRows;
          res.json(report);
        });
      });
    });
  });
});

/* Timer Control Routes */
app.post('/api/todos/:id/start-timer', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const now = new Date().toISOString();

  db.run(
    `UPDATE todos SET timerRunning = 1, actualStartTime = COALESCE(actualStartTime, ?), status = 'In Progress' WHERE id = ? AND userId = ?`,
    [now, id, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Todo not found" });
      res.json({ success: true, timerRunning: true, actualStartTime: now });
    }
  );
});

app.post('/api/todos/:id/stop-timer', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const now = new Date().toISOString();

  db.run(
    `UPDATE todos SET timerRunning = 0, actualEndTime = ?, status = 'Completed', completedDate = ? WHERE id = ? AND userId = ?`,
    [now, now, id, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Todo not found" });
      res.json({ success: true, timerRunning: false, actualEndTime: now, status: 'Completed' });
    }
  );
});

app.post('/api/todos/:id/pause-timer', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    `UPDATE todos SET timerRunning = 0, status = 'In Progress' WHERE id = ? AND userId = ?`,
    [id, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Todo not found" });
      res.json({ success: true, timerRunning: false });
    }
  );
});

/* Protected CRUD Route Builder */
function buildProtectedRoutes(tableName, routeName) {
  app.post(`/api/${routeName}`, authenticateToken, (req, res) => {
    const item = req.body;
    item.userId = req.user.id;
    const fields = Object.keys(item);
    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(f => (typeof item[f] === 'object' ? JSON.stringify(item[f]) : (item[f] === true ? 1 : item[f] === false ? 0 : item[f])));

    db.run(`INSERT OR REPLACE INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`, values, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: item.id });
    });
  });

  app.delete(`/api/${routeName}/:id`, authenticateToken, (req, res) => {
    db.run(`DELETE FROM ${tableName} WHERE id = ? AND userId = ?`, [req.params.id, req.user.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  });
}

buildProtectedRoutes('todos', 'todos');
buildProtectedRoutes('recurring_templates', 'templates');
buildProtectedRoutes('income', 'income');
buildProtectedRoutes('expenses', 'expenses');
buildProtectedRoutes('savings', 'savings');
buildProtectedRoutes('events', 'events');

app.listen(PORT, () => console.log(`ProFinance Fullstack Server online on port ${PORT}`));
