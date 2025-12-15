'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '@/lib/firebase';
import {
    Loader2,
    X,
    FileBarChart,
    HelpCircle,
    CheckCircle2,
    Lightbulb,
    Award,
    AlertCircle,
    FileText,
    ArrowLeft,
    Percent,
    ChevronLeft
} from 'lucide-react';

export default function ReportPage() {
    const { id } = useParams();
    const { user, loading } = useAuth();
    const router = useRouter();
    const [report, setReport] = useState<any>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        const fetchReport = async () => {
            try {
                const reportId = Array.isArray(id) ? id[0] : id;
                if (!reportId) return;

                const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'reports', reportId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setReport({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                }
            } catch (e) {
                console.error("Error fetching report:", e);
            } finally {
                setFetching(false);
            }
        };

        fetchReport();
    }, [user, loading, id, router]);

    if (loading || fetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
                <Loader2 className="animate-spin text-[var(--brand-primary)]" size={32} />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-main)]">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Report not found</h1>
                <button
                    onClick={() => window.close()}
                    className="px-6 py-2 text-sm font-medium text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] rounded-[var(--radius-md)] transition-colors shadow-sm"
                >
                    Close Tab
                </button>
            </div>
        );
    }

    const { gradingResult, reportOptions } = report;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-[var(--radius-xl)] shadow-lg flex flex-col overflow-hidden border border-[var(--border-light)] animate-in fade-in duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.back()}
                            className="text-[var(--text-secondary)] hover:scale-110 hover:text-[var(--text-primary)] transition-all"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{report.title}</h2>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">
                                {report.worksheetType} • {gradingResult.marksObtained}/{gradingResult.totalMarks}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.open(report.worksheetUrl, '_blank')}
                        className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-gray-100 rounded-[var(--radius-md)] transition-colors border border-transparent hover:border-gray-200"
                    >
                        View Worksheet
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow space-y-8 p-6">

                    {/* Grade Summary */}
                    {reportOptions?.fullGrade && gradingResult?.grade && (
                        <div className="flex flex-col gap-4">
                            {/* <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-[var(--brand-primary)]">{gradingResult.marksObtained}/{gradingResult.totalMarks}</span>
                                <span className="text-3xl font-bold text-[var(--brand-primary)]">({gradingResult.marksObtained / gradingResult.totalMarks * 100}%)</span>
                            </div> */}
                            <div>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><Percent className="text-[var(--brand-primary)]" /> Overall Performance</h3>
                                <p className="text-[var(--text-secondary)]">The candidate obtained a score of {gradingResult.marksObtained} out of {gradingResult.totalMarks} ({gradingResult.marksObtained / gradingResult.totalMarks * 100}%). {gradingResult.feedback}</p>
                            </div>
                        </div>
                    )}

                    {/* Mistakes Analysis */}
                    {reportOptions?.mistakeExplanation && gradingResult?.mistakes?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <AlertCircle className="text-red-500" /> Areas for Improvement
                            </h3>
                            <div className="space-y-4">
                                {gradingResult.mistakes.map((mistake: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-red-50 rounded-[var(--radius-md)] border border-red-100">
                                        <p className="font-semibold text-red-700 mb-1">{mistake.question}</p>
                                        <p className="text-red-600 text-sm">{mistake.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    {reportOptions?.tips && gradingResult?.tips?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <Lightbulb className="text-amber-500" /> Tips for Next Time
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gradingResult.tips.map((tip: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 p-4 bg-amber-50 rounded-[var(--radius-md)] border border-amber-100">
                                        <CheckCircle2 size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-amber-800 text-sm">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Skills */}
                    {reportOptions?.skillsSummary && gradingResult?.skills?.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                <Award className="text-purple-500" /> Skills Demonstrated
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {gradingResult.skills.map((skill: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Raw Output Fallback */}
                    {!gradingResult && (
                        <div className="p-8 text-center text-gray-500">
                            <p>Analysis failed. Please report this error to <a href="mailto:businesstntr@gmail.com" className="text-blue-500 hover:underline">businesstntr@gmail.com</a> and try again later.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
