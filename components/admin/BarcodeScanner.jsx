"use client";

import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const [data, setData] = useState("No result");

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg bg-black">
                <QrReader
                    onResult={(result, error) => {
                        if (!!result) {
                            setData(result?.text);
                            onScanSuccess(result?.text, result);
                        }

                        if (!!error) {
                            // console.info(error);
                        }
                    }}
                    style={{ width: '100%' }}
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
