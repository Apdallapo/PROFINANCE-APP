import { useState } from 'react';
import { api } from '../services/api';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    try {
      const data = isLogin ? await api.login(email, password) : await api.register(name, email, password);
      if (data.error) setError(data.error);
      else if (data.token) onAuthSuccess();
    } catch {
      setError("Cannot reach backend database authentication cluster.");
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0F1117', color: '#F3F4F6' }}>
      <form onSubmit={handleSubmit} style={{ background: '#1F2937', padding: 32, borderRadius: 12, width: 340 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, textAlign: 'center', color: '#3B82F6' }}>ProFinance v2</h2>
        {error && <div style={{ border: '1px solid #EF4444', color: '#EF4444', padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 16 }}>{error}</div>}
        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Full Name</label>
            <input type="text" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} required style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: 8, borderRadius: 6, color: '#FFF' }} />
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: 8, borderRadius: 6, color: '#FFF' }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required style={{ width: '100%', background: '#111827', border: '1px solid #374151', padding: 8, borderRadius: 6, color: '#FFF' }} />
        </div>
        <button type="submit" style={{ width: '100%', background: '#3B82F6', color: '#FFF', padding: 10, borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer' }}>{isLogin ? 'Sign In' : 'Create Account'}</button>
        <p style={{ fontSize: 12, textAlign: 'center', marginTop: 16, color: '#9CA3AF' }}>
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#3B82F6', cursor: 'pointer' }}>{isLogin ? 'Create an account' : 'Sign in instead'}</span>
        </p>
      </form>
    </div>
  );
}
