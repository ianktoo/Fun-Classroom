import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { isSupabaseConfigured } from '../config';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setMessage("Application is not configured. Please update the .env file.");
      return;
    }

    setLoading(true);
    setMessage('');
    
    const authMethod = isLogin ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await authMethod({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
        if (!isLogin) {
            setMessage('Check your email for the verification link!');
        }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-pink-200 to-blue-200 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
        <h1 className="font-display text-4xl text-center text-gray-800 mb-2">Classroom FunTime!</h1>
        <p className="text-center text-gray-600 mb-8">{isLogin ? 'Welcome back, Teacher!' : 'Join the Fun!'}</p>

        {!isSupabaseConfigured && (
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-r-lg" role="alert">
            <p className="font-bold">Configuration Needed</p>
            <p>Please add your Supabase credentials to a <code>.env</code> file to enable all features.</p>
          </div>
        )}

        <form onSubmit={handleAuth}>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 bg-white rounded-lg border-2 border-gray-200 focus:outline-none focus:border-blue-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!isSupabaseConfigured}
            />
            <input
              className="w-full px-4 py-3 bg-white rounded-lg border-2 border-gray-200 focus:outline-none focus:border-blue-400 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!isSupabaseConfigured}
            />
          </div>
          <div className="mt-8">
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isSupabaseConfigured}
            >
              {loading ? <span>Loading...</span> : <span>{isLogin ? 'Log In' : 'Sign Up'}</span>}
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-500 hover:underline">
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;