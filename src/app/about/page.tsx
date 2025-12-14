'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Radar } from 'lucide-react';
import IconBackground from '@/components/IconBackground';

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen text-[var(--text-primary)] relative">
            <IconBackground />
            <div className="relative z-10">
                {/* Header */}
                <header className="bg-[var(--bg-card)] border-b border-[var(--border-light)] sticky top-0 z-20">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full hover:text-[var(--text-secondary)] hover:scale-130 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-xl font-bold">About CheckYourPaper</h1>
                    </div>
                </header>

                {/* Content */}
                <main className="max-w-3xl mx-auto p-6 sm:p-10">
                    <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--border-light)] p-8 sm:p-12">

                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[var(--brand-primary)] mb-4">
                                <Radar size={40} />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">CheckYourPaper</h2>
                            <p className="text-[var(--text-secondary)]">AI-Powered Grading Assistant</p>
                        </div>

                        <div className="prose prose-slate max-w-none space-y-6 text-[var(--text-primary)]">
                            <p>
                                CheckYourPaper is an innovative platform designed to help students and educators streamline the grading process.
                                By leveraging advanced Artificial Intelligence, we provide instant, detailed feedback on worksheets and past papers.
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4">Our Mission</h3>
                            <p>
                                Our mission is to democratize access to high-quality academic feedback. We believe that every student deserves
                                to know exactly where they stand and how to improve, without waiting days or weeks for a teacher to grade their work.
                            </p>

                            <h3 className="text-xl font-bold mt-8 mb-4">How It Works</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Upload:</strong> Simply scan or upload your completed worksheet.</li>
                                <li><strong>Analyze:</strong> Our AI compares your answers against the provided markscheme.</li>
                                <li><strong>Learn:</strong> Receive a comprehensive report with grades, corrections, and personalized tips.</li>
                            </ul>

                            <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-[var(--text-secondary)]">
                                <p>© {new Date().getFullYear()} CheckYourPaper. All rights reserved.</p>
                                <p>Version 1.0.0 (Beta)</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
