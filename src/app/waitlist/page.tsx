'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogOut, Clock } from 'lucide-react';

export default function WaitlistPage() {
    const { userProfile, loading } = useAuth();

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-[var(--radius-xl)] shadow-lg max-w-md w-full border border-[var(--border-light)]">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-50 p-4 rounded-full">
                        <Clock size={48} className="text-[var(--brand-primary)]" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">You're on the Waitlist</h1>

                <p className="text-[var(--text-secondary)] mb-6">
                    Thanks for signing up, <span className="font-semibold">{userProfile?.displayName}</span>!
                    We're currently in private beta. You'll receive access to the app once your account has been approved by our team.
                </p>

                {userProfile?.status === 'rejected' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
                        Unfortunately, your request for access has been denied at this time.
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-secondary)] hover:bg-gray-50 transition-colors"
                >
                    <LogOut size={16} /> Sign Out
                </button>
            </div>
        </div>
    );
}
