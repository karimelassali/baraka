"use client";

import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const [data, setData] = useState("No result");

    return (

        <div className="w-full max-w-md mx-auto relative flex flex-col gap-6">
            <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 relative min-h-[300px]">
                <QrReader
                    onResult={(result, error) => {
                        if (!!result) {
                            setData(result?.text);
                            onScanSuccess(result?.text, result);
                        }
                    }}
                    style={{ width: '100%' }}
                    videoContainerStyle={{ paddingTop: '100%' }}
                    videoStyle={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    constraints={{ facingMode: 'environment' }}
                />
            </div>

            {/* Manual Input Fallback */}
            <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Non riesci a scansionare? Inserisci ID manualmente:</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. 123e45..."
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                        onChange={(e) => setData(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onScanSuccess(e.currentTarget.value, null);
                        }}
                    />
                    <button
                        className="px-4 py-2 bg-black text-white text-sm font-bold rounded-md disabled:opacity-50"
                        onClick={() => onScanSuccess(data, null)}
                        disabled={!data || data === "No result"}
                    >
                        Check
                    </button>
                </div>
            </div>
        </div>
    );

};

export default BarcodeScanner;
