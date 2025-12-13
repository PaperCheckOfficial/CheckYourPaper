
"use client";
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]">
      <div className="flex flex-col gap-4 w-full max-w-sm p-8 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-light)] shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Login or Sign Up</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white text-[var(--text-primary)]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-2 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white text-[var(--text-primary)]"
        />
        <button
          onClick={handleEmailLogin}
          className="w-full py-2.5 rounded-[var(--radius-md)] bg-[var(--brand-primary)] text-white font-medium hover:bg-[var(--brand-primary-hover)] transition-colors shadow-sm"
        >
          Login with Email
        </button>
        <button
          onClick={handleEmailSignUp}
          className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--brand-primary)] text-[var(--brand-primary)] font-medium hover:bg-blue-50 transition-colors"
        >
          Sign Up with Email
        </button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[var(--border-light)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--bg-card)] px-2 text-[var(--text-secondary)]">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white text-[var(--text-primary)] font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Sign in with Google
        </button>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
      </div>
    </div>
  );
}

