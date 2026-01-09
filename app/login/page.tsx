'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
        })
      : await supabase.auth.signInWithPassword({
          email,
          password,
        });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      await router.replace('/dashboard');
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="border border-[#1c1c1d] bg-[#0d0d0e] p-8 sm:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="space-y-1 mb-8 text-xs uppercase tracking-[0.5em] text-[#8c8c8c]">
              <p>Barakat Jewelry</p>
            </div>
            <h1 className="text-2xl font-light text-white mb-4 uppercase tracking-[0.3em]">
              {isSignUp ? 'Create account' : 'Welcome'}
            </h1>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#adadad]">
              {isSignUp ? 'Fill in your details to register' : 'Sign in to your account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input font-engravers block w-full pl-4 pr-4 py-3 border border-[#1c1c1d] bg-[#050505] text-white placeholder-[#8c8c8c] focus:outline-none focus:border-[#d4b196] transition-colors text-sm"
                />
              </div>
            </div>

            <div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input font-engravers block w-full pl-4 pr-4 py-3 border border-[#1c1c1d] bg-[#050505] text-white placeholder-[#8c8c8c] focus:outline-none focus:border-[#d4b196] transition-colors text-sm"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="border border-[#d54b4b] bg-[#0d0d0e] p-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#ffb9b9] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-[#ffb9b9] uppercase tracking-[0.2em]">{errorMsg}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#d4b196] bg-[#0d0d0e] text-[#e7c5a5] py-3 px-4 text-[11px] uppercase tracking-[0.35em] transition-colors hover:bg-[#d4b196] hover:text-[#050505] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-[#e7c5a5]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[#e7c5a5]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Signing up...' : 'Signing in...'}
                </span>
              ) : (
                isSignUp ? 'Sign up' : 'Sign in'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#adadad]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((prev) => !prev);
                  setErrorMsg('');
                }}
                className="text-[#d4b196] hover:text-[#e7c5a5] transition-colors underline-offset-4 hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
