'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { upload } from '@vercel/blob/client';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Camera, Lock, ArrowLeft, Loader2, ChevronLeft } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    setSuccessMessage('');

    try {
      let newPhotoURL = photoURL;
      if (newPhotoFile) {
        const newBlob = await upload(`${Date.now()}-${newPhotoFile.name}`, newPhotoFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        newPhotoURL = newBlob.url;
      }

      await updateProfile(user, {
        displayName: displayName,
        photoURL: newPhotoURL,
      });

      if (email !== user.email) {
        await updateEmail(user, email);
      }

      setPhotoURL(newPhotoURL);
      setNewPhotoFile(null);
      setSuccessMessage('Profile updated successfully!');

    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle specific errors, e.g., re-authentication needed for email change
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = () => {
    if (user && user.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          setSuccessMessage('Password reset email sent!');
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error);
        });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="animate-spin text-[var(--brand-primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-light)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:text-[var(--text-secondary)] hover:scale-130 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Account Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-lg shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={newPhotoFile ? URL.createObjectURL(newPhotoFile) : photoURL || `https://ui-avatars.com/api/?name=${displayName || email}&background=random`}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-md"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => { if (e.target.files && e.target.files[0]) setNewPhotoFile(e.target.files[0]); }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-[var(--bg-card)] p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <Camera size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-grow w-full">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 h-12 border border-gray-300 rounded-md focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Password</label>
                  <button
                    // onClick={handlePasswordReset}
                    className="cursor-not-allowed w-full flex items-center h-12 justify-start gap-2 px-3 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-main)]"
                  >
                    <Lock size={16} />
                    ••••••••••
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-6 flex justify-end items-center gap-4">
          {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[var(--brand-primary)] text-white font-semibold rounded-md shadow-sm hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:bg-[var(--brand-primary)] flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
