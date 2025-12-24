"use client";

import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const [data, setData] = useState("No result");

    return (
        <div className="w-full max-w-md mx-auto relative">
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
            <p className="text-center text-sm text-gray-500 mt-2">
                Posiziona il codice a barre della carta fedeltà.
            </p>
        </div>
    );
};

export default BarcodeScanner;
