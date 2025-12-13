'use client'

import React, { useState, useEffect, useRef, JSX } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  MoreHorizontal,
  Plus,
  UploadCloud,
  ChevronDown,
  LogOut,
  User,
  CheckCircle2,
  HelpCircle,
  FileBarChart,
  Shield,
  Search,
  Loader2,
  Radar,
  Trash2,
  Edit,
  ExternalLink,
  FileInput
} from 'lucide-react';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { auth, db, appId } from '@/lib/firebase';
import { upload } from '@vercel/blob/client';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';




// --- Components ---

// 1. Profile Dropdown
const ProfileMenu = ({ onLogout, user }: { onLogout: () => void; user: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { userProfile } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
  const photoURL = user.photoURL;

  return (
    <div className="relative" ref={menuRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-[var(--radius-md)] transition-colors pr-3 border border-transparent hover:border-gray-200 select-none"
      >
        {photoURL ? (
          <img src={photoURL} alt={displayName} className="h-8 w-8 rounded-full ring-2 ring-white shadow-sm" />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-cyan-400 overflow-hidden ring-2 ring-white shadow-sm flex items-center justify-center text-white font-bold text-xs">
            {displayName ? displayName.substring(0, 2).toUpperCase() : 'US'}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-bold text-[var(--text-primary)]">{displayName}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[var(--radius-lg)] shadow-xl border border-[var(--border-light)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user.email || 'Anonymous User'}</p>
          </div>

          <button
            onClick={() => { router.push('/profile'); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] flex items-center gap-2">
            <User size={16} /> Account
          </button>
          <button
            onClick={() => { router.push('/about'); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] flex items-center gap-2">
            <HelpCircle size={16} /> About CheckYourPaper
          </button>
          <button
            onClick={() => { router.push('/legal'); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] flex items-center gap-2">
            <Shield size={16} /> Terms and Policy
          </button>

          {userProfile?.status === 'admin' && (
            <button
              onClick={() => { router.push('/admin'); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-[var(--brand-primary)] hover:bg-blue-50 font-medium flex items-center gap-2"
            >
              <ShieldAlert size={16} /> Admin Panel
            </button>
          )}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Document Card (Standardized Report Type)
const DocumentCard = ({
  doc,
  onRename,
  onDelete
}: {
  doc: any;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(doc.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle !== doc.title) {
      onRename(doc.id, newTitle);
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setNewTitle(doc.title);
      setIsRenaming(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-light)] rounded-[var(--radius-lg)] p-4 flex flex-col hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1 duration-300 h-full relative">
      {/* Thumbnail */}
      <div className="bg-gray-50 rounded-[var(--radius-md)] h-40 mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-blue-50/30 transition-colors">
        <div className="transform group-hover:scale-105 transition-transform duration-300 relative">
          {/* Generic Report Icon */}
          <div className="w-20 h-24 bg-white border border-gray-200 shadow-sm rounded flex flex-col items-center p-2">
            <div className="w-full h-2 bg-gray-100 rounded mb-2"></div>
            <div className="w-full h-1 bg-gray-100 rounded mb-1"></div>
            <div className="w-2/3 h-1 bg-gray-100 rounded mb-3"></div>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mt-auto">
              A+
            </div>
          </div>
          <div className="absolute -right-2 -bottom-2 bg-[var(--brand-primary)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
            REPORT
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-start mt-auto relative">
        <div className="flex-grow mr-2">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              className="w-full text-sm font-semibold text-[var(--text-primary)] border border-[var(--brand-primary)] rounded px-1 py-0.5 outline-none"
            />
          ) : (
            <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 text-sm" title={doc.title}>
              {doc.title}
            </h3>
          )}
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[var(--text-secondary)] text-xs">{doc.date}</p>
            {doc.worksheetType && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {doc.worksheetType}
              </span>
            )}
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="text-[var(--text-secondary)] hover:bg-gray-100 p-1 rounded-[var(--radius-sm)] transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-[var(--radius-md)] shadow-xl border border-[var(--border-light)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={(e) => { e.stopPropagation(); window.open(doc.worksheetUrl, '_blank'); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] flex items-center gap-2"
              >
                <FileText size={14} /> Open Worksheet
              </button>

              {doc.markschemeUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(doc.markschemeUrl, '_blank'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] flex items-center gap-2"
                >
                  <CheckCircle2 size={14} /> Open Markscheme
                </button>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-gray-50 hover:text-[var(--text-primary)] flex items-center gap-2"
              >
                <Edit size={14} /> Rename
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={(e) => { e.stopPropagation(); onDelete(doc.id); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 3. Add Document Wizard Page
const AddDocumentPage = ({ onCancel, onFinish, userId }: { onCancel: () => void; onFinish: () => void; userId: string }) => {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Form State
  const [worksheetName, setWorksheetName] = useState('');
  const [worksheetFile, setWorksheetFile] = useState<File | null>(null);
  const [worksheetType, setWorksheetType] = useState('Balanced');

  const [markschemeType, setMarkschemeType] = useState('existing');
  const [markschemeFile, setMarkschemeFile] = useState<File | null>(null);
  const [selectedMarkschemeId, setSelectedMarkschemeId] = useState('');

  // We can fetch these from DB too
  const [existingMarkschemes, setExistingMarkschemes] = useState<Array<{ id: string; name: string }>>([]);

  // Define the shape of report options for type safety
  interface ReportOptions {
    fullGrade: boolean;
    mistakeExplanation: boolean;
    tips: boolean;
    skillsSummary: boolean;
  }

  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    fullGrade: true,
    mistakeExplanation: true,
    tips: true,
    skillsSummary: true,
  });

  // Typed list of report option definitions for rendering
  const reportOptionList: { id: keyof ReportOptions; label: string; icon: JSX.Element }[] = [
    { id: 'fullGrade', label: 'Full Grade', icon: <FileBarChart size={20} /> },
    { id: 'mistakeExplanation', label: 'Explanation of Mistakes', icon: <HelpCircle size={20} /> },
    { id: 'tips', label: 'Tips for Answering', icon: <CheckCircle2 size={20} /> },
    { id: 'skillsSummary', label: 'Summary of Skills', icon: <FileText size={20} /> },
  ];

  // Fetch markschemes on mount
  useEffect(() => {
    if (!userId) return;
    // In a real app, this would query a 'markschemes' collection
    // For this demo, we'll just simulate a few or query if you had them
    setExistingMarkschemes([
      { id: 'ms1', name: 'IB Math HL 2023 (Sample)' },
      { id: 'ms2', name: 'A-Level English Lit v2 (Sample)' }
    ]);
  }, [userId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const msFileInputRef = useRef<HTMLInputElement>(null);

  const STEPS = [
    { num: 1, name: 'Worksheet' },
    { num: 2, name: 'Markscheme' },
    { num: 3, name: 'Report' }
  ];

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    let isValid = true;

    // Step 1 validation
    if (step === 1) {
      if (!worksheetName.trim()) {
        newErrors.worksheetName = true;
        isValid = false;
      }
      if (!worksheetFile) {
        newErrors.worksheetFile = true;
        isValid = false;
      }
    }

    // Step 2 validation
    if (step === 2) {
      if (markschemeType === 'new' && !markschemeFile) {
        newErrors.markschemeFile = true;
        isValid = false;
      }
      if (markschemeType === 'existing' && !selectedMarkschemeId) {
        newErrors.selectedMarkschemeId = true;
        isValid = false;
      }
    }

    setErrors(newErrors);

    if (isValid) {
      if (step < 3) setStep(step + 1);
      else handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!db || !auth.currentUser) {
      console.error("Firebase services are not initialized correctly.");
      return;
    }
    setIsUploading(true);
    try {
      // 1. Upload Worksheet
      let worksheetUrl = '';
      if (worksheetFile) {
        const newBlob = await upload(`${Date.now()}-${worksheetFile.name}`, worksheetFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        worksheetUrl = newBlob.url;
      }

      // 2. Upload Markscheme (if new)
      let markschemeUrl = '';
      let finalMarkschemeId = selectedMarkschemeId;

      if (markschemeType === 'new' && markschemeFile) {
        const newBlob = await upload(`${Date.now()}-${markschemeFile.name}`, markschemeFile, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        markschemeUrl = newBlob.url;

        // Optional: Save this new markscheme to a 'markschemes' collection for reuse
        finalMarkschemeId = 'new_upload';
      }

      // 3. Save Report Metadata to Firestore
      const reportData = {
        title: worksheetName,
        worksheetType,
        worksheetUrl,
        markschemeType,
        markschemeId: finalMarkschemeId,
        markschemeUrl,
        reportOptions,
        status: 'processing', // This would trigger a cloud function in a real app
        createdAt: serverTimestamp(),
        userId: userId // Storing userId in doc for security rules/indexing
      };

      await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'reports'), reportData);

      setIsUploading(false);
      onFinish();

    } catch (error) {
      console.error("Error creating report:", error);
      // Placeholder for custom modal UI instead of alert()
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
      {/* Wizard Header */}
      <header className="bg-white border-b border-[var(--border-light)] px-6 py-4 grid items-center grid-cols-3 sticky top-0 z-30">
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="text-[var(--text-primary)] font-medium text-sm hover:text-red-500 transition-colors flex justify-start disabled:opacity-50"
        >
          Cancel
        </button>

        {/* Stepper */}
        <div className="flex justify-center items-center gap-2 sm:gap-4">
          {STEPS.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className={`flex items-center gap-2 ${step === s.num ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s.num ? 'bg-black text-white' : step > s.num ? 'bg-[var(--brand-primary)] text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === s.num ? 'text-black' : 'text-gray-500'}`}>
                  {s.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-8 sm:w-16 h-[1px] bg-gray-300 mx-2 sm:mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleBack}
            disabled={step === 1 || isUploading}
            className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--border-light)] bg-white hover:bg-gray-50 text-[var(--text-primary)] transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={isUploading}
            className="px-6 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white transition-colors shadow-sm flex items-center gap-2"
          >
            {isUploading ? <Loader2 className="animate-spin" size={16} /> : step === 3 ? 'Finish' : 'Next'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-3xl bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--border-light)] p-8 min-h-[500px]">

          {/* STEP 1: WORKSHEET */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Upload your Worksheet</h2>
                <p className="text-[var(--text-secondary)] mt-2">Provide the details for the document you want graded.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Worksheet Name</label>
                  <input
                    type="text"
                    value={worksheetName}
                    onChange={(e) => {
                      setWorksheetName(e.target.value);
                      if (errors.worksheetName) setErrors({ ...errors, worksheetName: false });
                    }}
                    placeholder="e.g., Calculus Midterm 2023"
                    className={`w-full px-4 py-3 rounded-[var(--radius-md)] border focus:ring-2 outline-none transition-all ${errors.worksheetName
                      ? 'border-red-500 focus:ring-red-500 bg-red-50'
                      : 'border-[var(--border-light)] focus:ring-[var(--brand-primary)] focus:border-transparent'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">Upload Document</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => { if (e.target.files && e.target.files[0]) setWorksheetFile(e.target.files[0]); }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                            border-2 border-dashed rounded-[var(--radius-lg)] h-48 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group
                            ${worksheetFile
                        ? 'border-[var(--brand-primary)] bg-blue-50'
                        : errors.worksheetFile
                          ? 'border-red-500 bg-red-50'
                          : 'border-[var(--border-dashed)] bg-[var(--bg-main)] hover:bg-blue-50 hover:border-[var(--brand-primary)]'
                      }
                        `}
                  >
                    <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} className={worksheetFile ? "text-green-500" : "text-[var(--brand-primary)]"} />
                    </div>
                    <div className="text-center">
                      {worksheetFile ? (
                        <>
                          <p className="text-[var(--text-primary)] font-bold">{worksheetFile.name}</p>
                          <p className="text-green-600 text-xs mt-1">Ready to upload</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[var(--text-primary)] font-medium">Click to select file</p>
                          <p className="text-[var(--text-secondary)] text-xs mt-1">PDF, DOCX, PNG</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-3">Document Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['Math', 'Balanced', 'Essay-Heavy'].map((type) => (
                      <div
                        key={type}
                        onClick={() => setWorksheetType(type)}
                        className={`
                          cursor-pointer rounded-[var(--radius-md)] p-4 border-2 text-center transition-all
                          ${worksheetType === type
                            ? 'border-[var(--brand-primary)] bg-blue-50 text-[var(--brand-primary)]'
                            : 'border-[var(--border-light)] hover:border-gray-300 text-[var(--text-secondary)]'}
                        `}
                      >
                        <span className="font-bold text-sm">{type}</span>
                      </div>
                    ))}
                  </div>

                  {/* Document Type Description */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] border border-[var(--border-light)] animate-in fade-in slide-in-from-top-2">
                    <p>
                      {worksheetType === 'Math' && "Best for structured problems with clear right/wrong answers and step-by-step working."}
                      {worksheetType === 'Balanced' && "Suitable for subjects like Science or Geography that mix short answers with longer explanations."}
                      {worksheetType === 'Essay-Heavy' && "Optimized for long-form writing, English Literature, History, or Philosophy papers."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MARKSCHEME */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Markscheme Configuration</h2>
                <p className="text-[var(--text-secondary)] mt-2">Select a grading key or upload a new one.</p>
              </div>

              <div className="space-y-6">

                {/* Option: Skip */}
                <div
                  onClick={() => setMarkschemeType('skip')}
                  className={`flex items-center p-4 rounded-[var(--radius-md)] border cursor-pointer transition-all ${markschemeType === 'skip' ? 'border-[var(--brand-primary)] bg-blue-50 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border-light)] hover:border-gray-300'}`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${markschemeType === 'skip' ? 'border-[var(--brand-primary)]' : 'border-gray-400'}`}>
                    {markschemeType === 'skip' && <div className="w-3 h-3 rounded-full bg-[var(--brand-primary)]" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">Skip Markscheme</h4>
                    <p className="text-xs text-[var(--text-secondary)]">I don't have a specific answer key.</p>
                  </div>
                </div>

                {/* Option: Existing */}
                <div
                  onClick={() => setMarkschemeType('existing')}
                  className={`flex flex-col p-4 rounded-[var(--radius-md)] border cursor-pointer transition-all ${markschemeType === 'existing' ? 'border-[var(--brand-primary)] bg-blue-50 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border-light)] hover:border-gray-300'}`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${markschemeType === 'existing' ? 'border-[var(--brand-primary)]' : 'border-gray-400'}`}>
                      {markschemeType === 'existing' && <div className="w-3 h-3 rounded-full bg-[var(--brand-primary)]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)]">Use Existing Markscheme</h4>
                      <p className="text-xs text-[var(--text-secondary)]">Select from your library.</p>
                    </div>
                  </div>

                  {markschemeType === 'existing' && (
                    <div className="ml-9 mt-2 animate-in fade-in slide-in-from-top-2">
                      <select
                        value={selectedMarkschemeId}
                        onChange={(e) => {
                          setSelectedMarkschemeId(e.target.value);
                          if (errors.selectedMarkschemeId) setErrors({ ...errors, selectedMarkschemeId: false });
                        }}
                        className={`w-full p-2.5 bg-white border rounded-[var(--radius-md)] text-sm focus:ring-2 outline-none ${errors.selectedMarkschemeId
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-[var(--border-light)] focus:ring-[var(--brand-primary)]'
                          }`}
                      >
                        <option value="">Select a markscheme...</option>
                        {existingMarkschemes.map(ms => (
                          <option key={ms.id} value={ms.id}>{ms.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Option: New */}
                <div
                  onClick={() => setMarkschemeType('new')}
                  className={`flex flex-col p-4 rounded-[var(--radius-md)] border cursor-pointer transition-all ${markschemeType === 'new' ? 'border-[var(--brand-primary)] bg-blue-50 ring-1 ring-[var(--brand-primary)]' : 'border-[var(--border-light)] hover:border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 ${markschemeType === 'new' ? 'border-[var(--brand-primary)]' : 'border-gray-400'}`}>
                      {markschemeType === 'new' && <div className="w-3 h-3 rounded-full bg-[var(--brand-primary)]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--text-primary)]">Add New Markscheme</h4>
                      <p className="text-xs text-[var(--text-secondary)]">Upload a new answer key to your library.</p>
                    </div>
                  </div>

                  {markschemeType === 'new' && (
                    <>
                      <input
                        type="file"
                        ref={msFileInputRef}
                        className="hidden"
                        onChange={(e) => { if (e.target.files && e.target.files[0]) setMarkschemeFile(e.target.files[0]); }}
                      />
                      <div
                        onClick={() => msFileInputRef.current?.click()}
                        className={`
                                ml-9 mt-4 h-24 border-2 border-dashed rounded-[var(--radius-md)] flex items-center justify-center text-xs transition-colors animate-in fade-in cursor-pointer
                                ${markschemeFile
                            ? 'border-green-400 text-green-600 bg-green-50'
                            : errors.markschemeFile
                              ? 'border-red-500 bg-red-50 text-red-500'
                              : 'border-gray-300 bg-white text-gray-500 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
                          }
                            `}
                      >
                        <Plus size={16} className="mr-2" />
                        {markschemeFile ? markschemeFile.name : 'Upload New File'}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: REPORT */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Report Preferences</h2>
                <p className="text-[var(--text-secondary)] mt-2">Customize what you want to see in the final analysis.</p>
              </div>

              {/* Report options are defined earlier; using reportOptionList from component scope */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reportOptionList.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setReportOptions(prev => ({ ...prev, [opt.id]: !prev[opt.id] }))}
                    className={`
                      p-5 rounded-[var(--radius-lg)] border cursor-pointer transition-all flex items-center justify-between
                      ${reportOptions[opt.id]
                        ? 'border-[var(--brand-primary)] bg-blue-50 shadow-sm'
                        : 'border-[var(--border-light)] hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${reportOptions[opt.id] ? 'bg-white text-[var(--brand-primary)]' : 'bg-gray-100 text-gray-500'}`}>
                        {opt.icon}
                      </div>
                      <span className={`font-semibold text-sm ${reportOptions[opt.id] ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'}`}>
                        {opt.label}
                      </span>
                    </div>

                    <div className={`
                      w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                      ${reportOptions[opt.id] ? 'bg-[var(--brand-primary)] border-transparent' : 'border-gray-300 bg-white'}
                    `}>
                      {reportOptions[opt.id] && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'add-document'
  const [docs, setDocs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const router = useRouter();

  // Auth logic handled by AuthContext now


  // --- Real Firestore Data Fetching ---
  useEffect(() => {
    if (!user || !db) {
      setDocs([]);
      return;
    }

    // Query: artifacts/{appId}/users/{userId}/reports
    const q = query(
      collection(db, 'artifacts', appId, 'users', user.uid, 'reports'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Timestamp to readable date
        date: doc.data().createdAt?.toDate().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        }) || 'Just now'
      }));
      setDocs(fetchedDocs);
    }, (error) => {
      console.error("Error fetching reports:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  // Filter documents based on search query
  const filteredDocs = docs.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(query) ||
      doc.worksheetType?.toLowerCase().includes(query) ||
      doc.date?.toLowerCase().includes(query)
    );
  });

  // --- Document Actions ---
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    if (!user || !db) return;

    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'reports', docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document.");
    }
  };

  const handleRenameDoc = async (docId: string, newTitle: string) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'reports', docId), {
        title: newTitle
      });
    } catch (error) {
      console.error("Error renaming document:", error);
      alert("Failed to rename document.");
    }
  };

  // --- Render ---

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  // View: Add Document Wizard
  if (view === 'add-document') {
    return (
      <>

        <AddDocumentPage
          onCancel={() => setView('dashboard')}
          onFinish={() => setView('dashboard')}
          userId={user.uid}
        />
      </>
    );
  }

  // View: Dashboard
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">


      {/* Header */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-light)] px-6 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="text-[var(--brand-primary)]">
            <Radar size={32} />
          </div>
          <h1 className="font-bold cursor-default select-none text-lg text-[var(--text-primary)] tracking-tight">CheckYourPaper</h1>
        </div>

        <div className="flex items-center gap-4">
          <ProfileMenu onLogout={handleLogout} user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 max-w-7xl mx-auto w-full">

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Reports</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Manage and view your graded papers.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Expandable Search */}
            <div className="flex items-center gap-2 h-[28px]">
              {isSearchExpanded && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="w-64 px-4 py-2.5 rounded-[var(--radius-md)] border border-[var(--border-light)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent outline-none transition-all text-sm animate-in fade-in slide-in-from-right-4 duration-200"
                  autoFocus
                />
              )}
              <button
                onClick={() => {
                  setIsSearchExpanded(!isSearchExpanded);
                  if (isSearchExpanded) setSearchQuery('');
                }}
                className="bg-white hover:bg-gray-50 text-[var(--text-primary)] font-medium p-2.5 rounded-[var(--radius-md)] flex items-center gap-2 transition-all border border-[var(--border-light)] shadow-sm active:scale-95"
              >
                <Search size={18} />
              </button>
            </div>
            <button
              onClick={() => setView('add-document')}
              className="h-[40px] bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-medium px-5 py-2.5 rounded-[var(--radius-md)] flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Document
            </button>
          </div>
        </div>



        {/* Document Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onRename={handleRenameDoc}
                onDelete={handleDeleteDoc}
              />
            ))
          ) : docs.length > 0 && searchQuery ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Search size={48} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-gray-500">No reports match your search</p>
              <p className="text-sm">Try a different search term.</p>
            </div>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <FileText size={48} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-gray-500">No reports found</p>
              <p className="text-sm">Click &#34;Add Document&#34; to get started.</p>
            </div>
          )}

          {/* Always show "Create New" card if there are docs, as the last item */}
          {filteredDocs.length > 0 && (
            <div
              onClick={() => setView('add-document')}
              className="border-2 border-dashed border-[var(--border-light)] rounded-[var(--radius-lg)] p-4 flex flex-col items-center justify-center text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] hover:bg-blue-50/50 transition-all cursor-pointer h-full min-h-[220px] group"
            >
              <div className="bg-gray-100 p-4 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
                <Plus size={24} />
              </div>
              <span className="font-medium text-sm">Check Another Paper</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
