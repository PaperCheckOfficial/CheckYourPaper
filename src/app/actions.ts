'use server';

import { del } from '@vercel/blob';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';

export async function deleteBlobs(urls: string[]) {
    await del(urls);
}

// Helper function to fetch file and convert to base64
async function fetchFileAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch file from ${url}: ${response.statusText}`);
            return null;
        }

        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return {
            data: base64,
            mimeType: contentType
        };
    } catch (error) {
        console.error(`Error fetching file from ${url}:`, error);
        return null;
    }
}

export async function generateReport(reportId: string, userId: string) {
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'default-app-id';

    // Helper to update status to failed
    const markAsFailed = async (error: string) => {
        if (!adminDb) return; // Can't update if no DB connection
        try {
            const ref = adminDb.collection('artifacts').doc(appId).collection('users').doc(userId).collection('reports').doc(reportId);
            await ref.update({
                status: 'failed',
                error: error,
                failedAt: new Date()
            });
        } catch (updateError) {
            console.error('Failed to update report status to failed:', updateError);
        }
    };

    if (!adminDb) {
        console.error('Firebase Admin is not initialized');
        // Cannot update Firestore without adminDb - throw to surface the error
        throw new Error('Firebase Admin is not initialized');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        await markAsFailed('Server configuration error: API key not set');
        return;
    }

    const reportRef = adminDb.collection('artifacts').doc(appId).collection('users').doc(userId).collection('reports').doc(reportId);

    try {
        // 1. Fetch the report data from Firestore
        const reportSnapshot = await reportRef.get();
        if (!reportSnapshot.exists) {
            console.error(`Report ${reportId} not found`);
            await markAsFailed('Report not found');
            return;
        }

        const reportData = reportSnapshot.data();
        if (!reportData) {
            console.error(`Report ${reportId} has no data`);
            await markAsFailed('Report has no data');
            return;
        }

        // 2. Initialize Gemini
        const genAI = new GoogleGenerativeAI(apiKey);

        const responseSchema: ResponseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                grade: { type: SchemaType.STRING, description: "The letter grade (e.g., A*, A, B, C, D, E, F)" },
                totalMarks: { type: SchemaType.NUMBER, description: "Total marks available for the assessment" },
                marksObtained: { type: SchemaType.NUMBER, description: "Total marks obtained by the student" },
                feedback: { type: SchemaType.STRING, description: "Overall feedback on the student's performance" },
                questions: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            question: { type: SchemaType.STRING, description: "The question identifier (e.g., 'Q3 (b)')" },
                            marksAvailable: { type: SchemaType.NUMBER, description: "Marks available for this question" },
                            marksAwarded: { type: SchemaType.NUMBER, description: "Marks awarded to the student for this question" },
                            explanation: { type: SchemaType.STRING, description: "Explanation of the answer, any mistakes, or why marks were given/deducted" }
                        },
                        required: ["question", "marksAvailable", "marksAwarded", "explanation"]
                    },
                    description: "Breakdown of each question with marks"
                },
                tips: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                    description: "Tips for improving performance"
                }
            },
            required: ["grade", "totalMarks", "marksObtained", "feedback", "questions", "tips"]
        };

        const isEssayHeavy = reportData.worksheetType === 'Essay-Heavy';
        const modelName = isEssayHeavy ? 'gemini-2.5-flash-lite' : 'gemini-2.5-flash';

        const modelParams: any = {
            model: modelName,
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: responseSchema
            }
        };

        if (!isEssayHeavy) {
            modelParams.thinkingConfig = { thinkingBudget: 3200, includeThoughts: true };
        }

        const model = genAI.getGenerativeModel(modelParams);

        // 3. Prepare content parts for Gemini
        const contentParts: Array<{ text: string } | { inlineData: { data: string; mimeType: string } }> = [];

        // Build the prompt
        let promptText = `You are an experienced academic examiner. Your task is to grade the following student worksheet and provide detailed feedback.

**Document Type:** ${reportData.worksheetType || 'General'}
**Report Options:** ${JSON.stringify(reportData.reportOptions || {})}

`;

        if (reportData.markschemeType === 'skip') {
            promptText += `**Grading Method:** Grade based on general academic knowledge and best practices for this subject area. There is no specific markscheme provided.

`;
        } else {
            promptText += `**Grading Method:** Use the provided markscheme to evaluate the student's work accurately.

`;
        }

        promptText += `Please analyze the student's work and provide:
1. An overall grade (A* to D and then U scale)
2. A percentage score
3. Total marks available and marks obtained
4. Comprehensive feedback on their performance
5. For EACH question: the question identifier, marks available, marks awarded, and an explanation of the answer/mistakes
6. Practical tips for improvement

Be fair, constructive, and educational in your assessment. If you cannot identify specific questions, use descriptive labels like "Section 1" or "Problem area 1". Estimate marks based on standard academic marking if not explicitly shown.`;

        contentParts.push({ text: promptText });

        // 4. Fetch and attach the worksheet file
        if (reportData.worksheetUrl) {
            const worksheetFile = await fetchFileAsBase64(reportData.worksheetUrl);
            if (worksheetFile) {
                contentParts.push({ text: "\n\n**Student Worksheet:**" });
                contentParts.push({ inlineData: worksheetFile });
            }
        }

        // 5. Fetch and attach the markscheme file (if present and not skipped)
        if (reportData.markschemeType !== 'skip' && reportData.markschemeUrl) {
            const markschemeFile = await fetchFileAsBase64(reportData.markschemeUrl);
            if (markschemeFile) {
                contentParts.push({ text: "\n\n**Markscheme / Answer Key:**" });
                contentParts.push({ inlineData: markschemeFile });
            }
        }

        // 6. Call Gemini API
        const result = await model.generateContent(contentParts);
        const response = result.response;
        const responseText = response.text();

        // 7. Parse the JSON response
        let gradingResult;
        try {
            gradingResult = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', parseError);
            console.error('Raw response:', responseText);
            throw new Error('Failed to parse AI response');
        }

        // 8. Update Firestore with the completed result
        await reportRef.update({
            status: 'completed',
            gradingResult: gradingResult,
            completedAt: new Date()
        });

        console.log(`Report ${reportId} processing completed successfully`);

    } catch (error) {
        console.error(`Error processing report ${reportId}:`, error);

        // Update document status to failed
        try {
            await reportRef.update({
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                failedAt: new Date()
            });
        } catch (updateError) {
            console.error('Failed to update report status to failed:', updateError);
        }
    }
}
