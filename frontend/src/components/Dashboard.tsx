import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layout } from './Layout';
import { colors } from '../theme/colors';
import Home from './pages/Home';
import Finance from './pages/Finance';
import Todos from './pages/Todos';
import Schedule from './pages/Schedule';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Savings from './pages/Savings';
import Reports from './pages/Reports';

type Page = 'home' | 'finance' | 'todos' | 'schedule' | 'income' | 'expenses' | 'savings' | 'reports';

interface AppState {
  user?: any;
  settings?: any;
  todos?: any[];
  income?: any[];
  expenses?: any[];
  savings?: any[];
}

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [state, setState] = useState<AppState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const appState = await api.getState();
        setState(appState);
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadState();
  }, []);

  const handleStateUpdate = async () => {
    try {
      const appState = await api.getState();
      setState(appState);
    } catch (error) {
      console.error('Failed to refresh state:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home state={state} onStateUpdate={handleStateUpdate} />;
      case 'finance':
        return <Finance state={state} onStateUpdate={handleStateUpdate} />;
      case 'todos':
        return <Todos state={state} onStateUpdate={handleStateUpdate} />;
      case 'schedule':
        return <Schedule state={state} onStateUpdate={handleStateUpdate} />;
      case 'income':
        return <Income state={state} onStateUpdate={handleStateUpdate} />;
      case 'expenses':
        return <Expenses state={state} onStateUpdate={handleStateUpdate} />;
      case 'savings':
        return <Savings state={state} onStateUpdate={handleStateUpdate} />;
      case 'reports':
        return <Reports state={state} onStateUpdate={handleStateUpdate} />;
      default:
        return <Home state={state} onStateUpdate={handleStateUpdate} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: colors.background, color: colors.text }}>
        <div style={{ fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} state={state}>
      {renderPage()}
    </Layout>
  );
}
