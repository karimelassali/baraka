'use client';

import { useEffect } from 'react';
import { generateInfrastructurePDF } from '@/utils/generateInfrastructurePDF';
import { useRouter } from 'next/navigation';

export default function InvoiceDownloadPage() {
    const router = useRouter();

    useEffect(() => {
        const download = async () => {
            await generateInfrastructurePDF();
            // Optional: Redirect back to admin after a short delay
            // setTimeout(() => router.push('/admin/payments'), 2000);
        };
        download();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Generating Invoice...</h1>
                <p className="text-gray-500 mb-6">Your infrastructure cost breakdown PDF is being generated and will download automatically.</p>

                <button
                    onClick={() => generateInfrastructurePDF()}
                    className="text-red-600 font-medium hover:text-red-700 underline"
                >
                    Click here if download doesn't start
                </button>
            </div>
        </div>
    );
}
