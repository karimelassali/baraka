'use client';

import { useState } from 'react';

export default function TestErrorPage() {
    const [shouldError, setShouldError] = useState(false);

    if (shouldError) {
        throw new Error('This is a test error to verify the custom error page!');
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <h1 className="text-2xl font-bold">Test Error Page</h1>
            <p className="text-muted-foreground text-center max-w-md">
                Click the button below to trigger a runtime error.
                <br />
                <span className="text-sm italic">
                    Note: In development mode, you will see a Next.js error overlay first.
                    You need to close it (click the X or press Esc) to see your custom error page.
                </span>
            </p>
            <button
                onClick={() => setShouldError(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
                Trigger Error
            </button>
        </div>
    );
}
