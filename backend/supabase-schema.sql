-- ProFinance Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  userId TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'USD',
  weekStart INTEGER DEFAULT 0
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recurring_templates table
CREATE TABLE IF NOT EXISTS recurring_templates (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT,
  daysOfWeek TEXT,
  startTime TEXT,
  endTime TEXT,
  active INTEGER DEFAULT 1
);

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  source TEXT,
  amount REAL,
  date TEXT,
  notes TEXT
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT,
  merchant TEXT,
  amount REAL,
  date TEXT,
  notes TEXT
);

-- Create savings table
CREATE TABLE IF NOT EXISTS savings (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal TEXT,
  targetAmount REAL,
  amount REAL,
  category TEXT,
  date TEXT,
  notes TEXT
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  time TEXT,
  category TEXT,
  recurring INTEGER DEFAULT 0,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_userId ON todos(userId);
CREATE INDEX IF NOT EXISTS idx_todos_date ON todos(date);
CREATE INDEX IF NOT EXISTS idx_income_userId ON income(userId);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
CREATE INDEX IF NOT EXISTS idx_expenses_userId ON expenses(userId);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_savings_userId ON savings(userId);
CREATE INDEX IF NOT EXISTS idx_events_userId ON events(userId);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_recurring_templates_userId ON recurring_templates(userId);
