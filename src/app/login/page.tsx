"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  FileText, CheckCircle2, Book, PenTool, GraduationCap, Calculator,
  Binary, Globe, Microscope, FlaskConical, Atom, Dna, Music, Palette,
  Trophy, Lightbulb, Brain, Puzzle, Layers, Archive, Folder, Search,
  Settings, User, Mail, Calendar, Clock, Compass, Map, Bookmark,
  Link, Cloud, Zap, Star, Heart, Smile, Lock, Shield, CreditCard,
  BarChart, TrendingUp, Code, Terminal, Database, Cpu, Server,
  Wifi, Bluetooth, Radio, Speaker, Mic, Video, Camera, Image,
  Printer, Smartphone, Tablet, Laptop, Monitor, Mouse, Keyboard,
  Radar
} from 'lucide-react';

import IconBackground from '@/components/IconBackground';


// --- Main Login Page ---

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign in cancelled.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Validation
        if (!name.trim()) {
          throw new Error("Name is required");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (!termsAccepted) {
          throw new Error("You must accept the Terms and Policy");
        }

        // Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update Profile with Name
        await updateProfile(userCredential.user, {
          displayName: name
        });

        // Save user to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: email,
          displayName: name,
          photoURL: '',
          status: 'pending',
          createdAt: serverTimestamp(),
        }, { merge: true });

      } else {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code) {
        setError(getFriendlyErrorMessage(err.code));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      if (err.code) {
        setError(getFriendlyErrorMessage(err.code));
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

      <IconBackground />

      <div className="absolute top-0 h-[80px] left-1/2 transform -translate-x-1/2 z-10 w-full max-w-sm bg-white/90 backdrop-blur-md rounded-b-[var(--radius-xl)] border border-[var(--border-light)] shadow-lg animate-in fade-in zoom-in-95 duration-300 flex items-center justify-center px-4">
        <a href="/about">
          <div className="flex items-center gap-2">
            <div className="text-[var(--brand-primary)]">
              <Radar size={32} />
            </div>
            <h1 className="font-bold select-none text-2xl text-[var(--text-primary)] tracking-tight">CheckYourPaper</h1>
          </div>
        </a>
      </div>

      <div className="relative z-10 w-full max-w-sm p-8 bg-white/90 backdrop-blur-md rounded-[var(--radius-xl)] border border-[var(--border-light)] shadow-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            {isSignUp ? 'Join CheckYourPaper today' : 'Enter your details to access your account'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {isSignUp && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white text-[var(--text-primary)] transition-all"
              />
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white text-[var(--text-primary)] transition-all"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white text-[var(--text-primary)] transition-all"
          />

          {isSignUp && (
            <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-4">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none bg-white text-[var(--text-primary)] transition-all"
              />

              <div className="flex items-start gap-2 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                />
                <label htmlFor="terms" className="text-xs text-[var(--text-secondary)] leading-tight">
                  I agree to the <a href="/legal" target="_blank" className="text-[var(--brand-primary)] hover:underline font-medium">Terms of Service and Privacy Policy</a>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-600 text-sm text-center animate-in shake">
              {error}
            </div>
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-3 mt-2 rounded-[var(--radius-md)] bg-[var(--brand-primary)] text-white font-bold hover:bg-[var(--brand-primary-hover)] transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border-light)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[var(--text-secondary)]">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white text-[var(--text-primary)] font-medium hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--brand-primary)] font-bold hover:underline focus:outline-none"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

