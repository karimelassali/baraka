"use server";

import jwt from "jsonwebtoken";
import { createClient } from "@/lib/supabase/server";

// --- Configuration Constants ---
// You can easily swap these URLs later
const BRAND_COLOR = "#E63946"; // Default vibrant red/pink or use user's #0096ff
const LOGO_IMAGE_URL = "https://www.googleusercontent.com/eff/w1920-h1080/logo.png"; // Placeholder: Ensure this is a valid publicly accessible URL
const HERO_IMAGE_URL = "https://www.googleusercontent.com/eff/w1920-h1080/hero.png"; // Placeholder: Ensure this is a valid publicly accessible URL
// ------------------------------

export async function generateGoogleWalletLink(userId: string) {
    try {
        const supabase = await createClient();

        console.log("--- Starting Google Wallet Link Generation ---");
        console.log("User ID:", userId);

        // 1. Fetch User Data
        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("id, first_name, last_name, phone_number")
            .eq("auth_id", userId)
            .single();

        if (customerError || !customer) {
            console.error("Error fetching customer:", customerError);
            throw new Error("Customer not found in database");
        }

        const { data: pointsData } = await supabase
            .from("customer_points_balance")
            .select("total_points")
            .eq("customer_id", customer.id)
            .single();

        const totalPoints = pointsData?.total_points || 0;

        // 2. Prepare Keys & Config
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
        const classIdRaw = process.env.GOOGLE_WALLET_CLASS_ID;

        // Sanitize Private Key
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, "\n").trim();

        // Ensure PEM format
        if (!privateKey.includes("\n") && privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
            privateKey = privateKey
                .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
                .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
        }

        // Validate Env Vars
        if (!clientEmail || !privateKey || !issuerId || !classIdRaw) {
            console.error("Missing Env Vars:", {
                hasEmail: !!clientEmail,
                hasKey: !!privateKey,
                hasIssuer: !!issuerId,
                hasClass: !!classIdRaw
            });
            throw new Error("Missing Google Wallet Environment Variables");
        }

        // 3. Construct Identifiers
        // Google Wallet requires: Class ID = {issuerId}.{suffix}
        // If your env var is already "3388... .elassali-tech", use it directly.
        // If it's just "elassali-tech", prefix it.
        // We will assume the env var might be WITHOUT the prefix if the user followed the wrong guide,
        // BUT typically in the console it allows creation of a full ID.
        // Let's force the valid format:

        // Check if classIdRaw already starts with issuerId.
        let classId = classIdRaw;
        if (!classId.startsWith(issuerId)) {
            // It's a suffix, prepend issuerId
            console.log("Prepending Issuer ID to Class ID");
            classId = `${issuerId}.${classIdRaw}`;
        }

        // Object ID must also start with issuerId
        // Sanitize customer ID to be alphanumeric/underscores/dots
        const safeCustomerId = customer.id.replace(/-/g, '_');
        const loyaltyObjectId = `${issuerId}.${safeCustomerId}`;

        console.log("Identifiers:", {
            issuerId,
            classId,
            loyaltyObjectId
        });

        // 4. Construct Loyalty Object
        const loyaltyObject = {
            id: loyaltyObjectId,
            classId: classId,
            state: "ACTIVE",
            accountId: customer.id,
            hexBackgroundColor: BRAND_COLOR,

            // Branding Images (Optional: Requires valid URLs hosted on Google or public HTTPS)
            // heroImage: {
            //     sourceUri: { uri: HERO_IMAGE_URL }
            // },
            // logo: {
            //     sourceUri: { uri: LOGO_IMAGE_URL }
            // },

            barcode: {
                type: "CODE_128", // Changed from QR_CODE
                value: customer.id,
                alternateText: customer.id,
            },
            textModulesData: [
                { header: "Punti", body: totalPoints.toString() },
                { header: "Nome", body: `${customer.first_name} ${customer.last_name}` },
                { header: "ID Socio", body: customer.id.substring(0, 8).toUpperCase() } // Shortened ID for display
            ],
            linksModuleData: {
                uris: [
                    {
                        uri: "https://elassali.netlify.app",
                        description: "Visita il sito",
                        id: "link_website"
                    },
                    {
                        uri: "tel:+391234567890", // Could use customer.phone_number if needed
                        description: "Chiama Baraka",
                        id: "link_phone"
                    }
                ]
            }
            // Check if reviewStatus is needed? usually "underReview" is default for drafts
            // but for a created class it should be fine.
        };

        // 5. Construct Claims
        const nowSeconds = Math.floor(Date.now() / 1000);

        const claims = {
            iss: clientEmail,
            aud: "google",
            typ: "savetowallet",
            iat: nowSeconds,
            origins: [], // Needed for strict security, verify if empty works for testing
            payload: {
                loyaltyObjects: [loyaltyObject],
            },
        };

        console.log("JWT Payload (Excluding payload for brevity):", {
            iss: claims.iss,
            aud: claims.aud,
            typ: claims.typ,
            iat: claims.iat
        });

        // 6. Sign
        const token = jwt.sign(claims, privateKey, { algorithm: "RS256" });
        const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

        console.log("--- Link Generated Successfully ---");
        return { success: true, url: saveUrl };

    } catch (error: any) {
        console.error("--- Google Wallet Link Generation Failed ---");
        console.error(error);
        return { success: false, error: error.message || "Unknown error occurred" };
    }
}