'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Shield } from 'lucide-react';

export default function LegalPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
            {/* Header */}
            <header className="bg-[var(--bg-card)] border-b border-[var(--border-light)] sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:text-[var(--text-secondary)] hover:scale-130 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Legal Information</h1>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto p-6 sm:p-10">
                <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--border-light)] p-8 sm:p-12">

                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        <Shield className="text-[var(--text-secondary)]" size={24} />
                        <h2 className="text-2xl font-bold">Terms of Service & Privacy Policy</h2>
                    </div>

                    <div className="space-y-12">

                        {/* Terms of Service */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Terms of Service</h3>
                            <div className="text-[var(--text-secondary)] space-y-4 text-sm leading-relaxed">
                                <p>
                                    <strong>1. Acceptance of Terms</strong><br />
                                    By accessing and using CheckYourPaper, you accept and agree to be bound by the terms and provision of this agreement.
                                </p>
                                <p>
                                    <strong>2. Use License</strong><br />
                                    Permission is granted to temporarily download one copy of the materials (information or software) on CheckYourPaper's website for personal, non-commercial transitory viewing only.
                                </p>
                                <p>
                                    <strong>3. Disclaimer</strong><br />
                                    The materials on CheckYourPaper's website are provided "as is". CheckYourPaper makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                                </p>
                                <p>
                                    <strong>4. Limitations</strong><br />
                                    In no event shall CheckYourPaper or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CheckYourPaper's Internet site.
                                </p>
                            </div>
                        </section>

                        {/* Privacy Policy */}
                        <section>
                            <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Privacy Policy</h3>
                            <div className="text-[var(--text-secondary)] space-y-4 text-sm leading-relaxed">
                                <p>
                                    <strong>1. Information Collection</strong><br />
                                    We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form.
                                </p>
                                <p>
                                    <strong>2. Use of Information</strong><br />
                                    Any of the information we collect from you may be used in one of the following ways:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>To personalize your experience</li>
                                    <li>To improve our website</li>
                                    <li>To improve customer service</li>
                                    <li>To process transactions</li>
                                    <li>To send periodic emails</li>
                                </ul>
                                <p>
                                    <strong>3. Data Protection</strong><br />
                                    We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.
                                </p>
                                <p>
                                    <strong>4. Third Party Links</strong><br />
                                    Occasionally, at our discretion, we may include or offer third party products or services on our website. These third party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites.
                                </p>
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
