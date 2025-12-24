"use client";

import { generateGoogleWalletLink } from "@/lib/actions/google-wallet";
import { useState } from "react";
import Image from "next/image";

interface AddToGoogleWalletProps {
    userId: string;
}

export function AddToGoogleWallet({ userId }: AddToGoogleWalletProps) {
    const [loading, setLoading] = useState(false);

    const handleAddToWallet = async () => {
        try {
            setLoading(true);
            const result = await generateGoogleWalletLink(userId);

            if (result.success && result.url) {
                window.open(result.url, "_blank");
            } else {
                console.error("Failed to get wallet link:", result.error);
                alert("Failed to generate Google Wallet pass. Please try again.");
            }
        } catch (error) {
            console.error("Error adding to wallet:", error);
            alert("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleAddToWallet}
            disabled={loading}
            className="transition-opacity hover:opacity-90 active:opacity-100 disabled:opacity-50"
            aria-label="Add to Google Wallet"
        >
            <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Add_to_Google_Wallet_badge.svg/2560px-Add_to_Google_Wallet_badge.svg.png"
                alt="Add to Google Wallet"
                width={195} // Standard width for the button
                height={60} // Standard height based on aspect ratio
                unoptimized // Allow external image without adding to next.config.js domains
            />
        </button>
    );
}
