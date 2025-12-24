"use client";

import React, { useState } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner'; // Assuming you use sonner or similar for toasts



const RobustScanner = ({ onScanSuccess }) => {
    const [manualCode, setManualCode] = useState("");
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState(null);

    // دالة التعامل مع المسح الناجح
    const handleScan = (detectedCodes) => {
        if (detectedCodes.length > 0 && !isPaused) {
            const code = detectedCodes[0].rawValue;
            if (code) {
                // نوقف المسح فوراً لتجنب التكرار
                setIsPaused(true);
                // نشغل الصوت إذا أردت
                // const audio = new Audio('/beep.mp3'); audio.play().catch(() => {});

                console.log("تم المسح بنجاح:", code);
                onScanSuccess(code);
            }
        }
    };

    // دالة التعامل مع الأخطاء دون انهيار التطبيق
    const handleError = (error) => {
        console.warn("Scanner Log:", error);
        // لا نعرض الخطأ للمستخدم إلا إذا كان حرجاً، لأن الكاميرا ترمي أخطاء صغيرة باستمرار
        if (error instanceof Error && error.name === 'NotAllowedError') {
            setError("يرجى السماح باستخدام الكاميرا من إعدادات المتصفح.");
        }
    };

    // دالة الإدخال اليدوي
    const handleManualSubmit = (e) => {
        e?.preventDefault();
        if (manualCode.trim()) {
            setIsPaused(true);
            onScanSuccess(manualCode.trim());
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">

            {/* منطقة الكاميرا */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-square border-4 border-black/10">
                {!isPaused ? (
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        // إعدادات الكاميرا الخلفية وتنسيقات الباركود
                        constraints={{
                            facingMode: 'environment',
                            aspectRatio: 1.0 // مربع
                        }}
                        formats={[
                            'code_128',
                            'code_39',
                            'code_93',
                            'codabar',
                            'ean_13',
                            'ean_8',
                            'upc_a',
                            'upc_e',
                            'qr_code',
                            'data_matrix',
                            'itf'
                        ]}
                        // إخفاء العناصر الزائدة
                        components={{
                            audio: false, // نتحكم في الصوت يدوياً أفضل
                            onOff: false,
                            torch: true,  // زر الفلاش مفيد في المحلات المظلمة
                            zoom: true,
                            finder: true, // يظهر إطار أخضر حول الكود
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: { objectFit: 'cover' }
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
                        <div className="text-green-400 text-5xl mb-4">✓</div>
                        <p>تم المسح بنجاح</p>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="mt-4 px-4 py-2 bg-white text-black rounded-full text-sm font-bold"
                        >
                            مسح منتج آخر
                        </button>
                    </div>
                )}

                {/* رسالة الخطأ إن وجدت */}
                {error && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-white p-4 text-center">
                        <div>
                            <p className="text-red-400 font-bold mb-2">تنبيه</p>
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-gray-700 rounded text-xs"
                            >
                                إعادة تحميل الصفحة
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-gray-500 font-medium">
                Punta la fotocamera verso il codice a barre (Code 128 / QR)
            </p>

            {/* الإدخال اليدوي (Fallback) */}
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect width="10" height="6" x="7" y="9" rx="2" /></svg>
                    Inserimento Manuale (ID Cliente)
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Es: 12345..."
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!manualCode.trim()}
                        className="px-6 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cerca
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RobustScanner;