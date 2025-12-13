'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
    const { userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (userProfile?.status !== 'admin') {
                router.push('/');
                return;
            }
            fetchPendingUsers();
        }
    }, [userProfile, authLoading, router]);

    const fetchPendingUsers = async () => {
        setLoadingUsers(true);
        try {
            const q = query(collection(db, 'users'), where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            const users: UserProfile[] = [];
            querySnapshot.forEach((doc) => {
                users.push(doc.data() as UserProfile);
            });
            setPendingUsers(users);
        } catch (error) {
            console.error("Error fetching pending users:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleStatusChange = async (uid: string, newStatus: 'approved' | 'rejected') => {
        setActionLoading(uid);
        try {
            const userRef = doc(db, 'users', uid);
            await updateDoc(userRef, { status: newStatus });

            // Remove from local state
            setPendingUsers(prev => prev.filter(u => u.uid !== uid));
        } catch (error) {
            console.error(`Error setting status to ${newStatus}:`, error);
            alert("Failed to update user status.");
        } finally {
            setActionLoading(null);
        }
    };

    if (authLoading || (loadingUsers && userProfile?.status === 'admin')) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <Loader2 className="animate-spin text-[var(--brand-primary)]" size={32} />
            </div>
        );
    }

    if (userProfile?.status !== 'admin') {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-6">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 bg-white border border-[var(--border-light)] rounded-[var(--radius-md)] hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <ShieldAlert className="text-[var(--brand-primary)]" /> Admin Panel
                            </h1>
                            <p className="text-[var(--text-secondary)] text-sm">Manage waitlist and user access.</p>
                        </div>
                    </div>
                </header>

                <div className="bg-white rounded-[var(--radius-xl)] border border-[var(--border-light)] shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-light)]">
                        <h2 className="font-bold text-lg">Pending Requests ({pendingUsers.length})</h2>
                    </div>

                    {pendingUsers.length === 0 ? (
                        <div className="p-12 text-center text-[var(--text-secondary)]">
                            <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500 opacity-20" />
                            <p>All caught up! No pending users.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingUsers.map((user) => (
                                <div key={user.uid} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">{user.displayName || 'No Name'}</p>
                                            <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">UID: {user.uid}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleStatusChange(user.uid, 'approved')}
                                            disabled={actionLoading === user.uid}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === user.uid ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(user.uid, 'rejected')}
                                            disabled={actionLoading === user.uid}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === user.uid ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                            Deny
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
