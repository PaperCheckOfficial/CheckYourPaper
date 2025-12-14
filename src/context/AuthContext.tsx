'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    status: UserStatus;
    createdAt: any;
}

interface AuthContextType {
    user: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userProfile: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        setUserProfile(userDocSnap.data() as UserProfile);
                    } else {
                        // Create new user document
                        const isAdmin = currentUser.email === process.env.ADMIN_EMAIL;
                        const newProfile: UserProfile = {
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            displayName: currentUser.displayName || '',
                            photoURL: currentUser.photoURL || '',
                            status: isAdmin ? 'admin' : 'pending',
                            createdAt: serverTimestamp(),
                        };

                        await setDoc(userDocRef, newProfile);
                        setUserProfile(newProfile);
                    }
                } catch (error) {
                    console.error("Error fetching/creating user profile:", error);
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Route protection logic
    useEffect(() => {
        if (loading) return;

        const isPublicRoute = ['/login', '/about', '/legal'].includes(pathname);
        const isWaitlistPage = pathname === '/waitlist';

        if (!user && !isPublicRoute) {
            router.push('/login');
            return;
        }

        if (user && userProfile) {
            // If user is pending or rejected, force them to waitlist
            if ((userProfile.status === 'pending' || userProfile.status === 'rejected') && !isWaitlistPage) {
                router.push('/waitlist');
            }

            // If user is approved or admin, and tries to go to waitlist, send them to dashboard
            if ((userProfile.status === 'approved' || userProfile.status === 'admin') && isWaitlistPage) {
                router.push('/');
            }
        }
    }, [user, userProfile, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, userProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
