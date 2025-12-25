"use server";

import { createClient } from "@/lib/supabase/server";
import { GoogleAuth } from "google-auth-library";

/**
 * Updates the existing Google Wallet Loyalty Object with new points.
 * @param userId - The Supabase Auth ID (auth_id) of the user.
 * @param newPoints - The new points balance to display.
 * @param customMessage - Optional message to trigger push notification.
 */
export async function updateGoogleWalletPoints(userId: string, newPoints: number, customMessage?: string) {
    console.log(`--- Starting Google Wallet Points Update for User: ${userId} ---`);

    try {
        const supabase = await createClient();

        // 1. Fetch User Data
        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("id")
            .eq("auth_id", userId)
            .single();

        if (customerError || !customer) {
            console.error("Error fetching customer:", customerError);
            throw new Error("Customer not found");
        }

        // 2. Prepare Keys & Config
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        let privateKey = process.env.GOOGLE_PRIVATE_KEY || "";
        const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;

        // Sanitize Private Key (reuse logic from generation action)
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        privateKey = privateKey.replace(/\\n/g, "\n").trim();
        if (!privateKey.includes("\n") && privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
            privateKey = privateKey
                .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
                .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----");
        }

        if (!clientEmail || !privateKey || !issuerId) {
            throw new Error("Missing Google Wallet Environment Variables");
        }

        // 3. Construct Loyalty Object ID
        // MUST MATCH generation logic: ${issuerId}.${safeCustomerId}
        const safeCustomerId = customer.id.replace(/-/g, '_');
        const loyaltyObjectId = `${issuerId}.${safeCustomerId}`;

        console.log("Updating Wallet Object:", loyaltyObjectId);

        // 4. Authenticate with Google
        const auth = new GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey,
            },
            scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
        });

        const client = await auth.getClient();

        // 5. Fetch Existing Object
        // We fetch first to preserve other fields (like Name, Images, etc.)
        const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";
        const objectUrl = `${baseUrl}/loyaltyObject/${loyaltyObjectId}`;

        console.log("Fetching existing object...");
        const response = await client.request({
            url: objectUrl,
            method: "GET",
        });

        const existingObject = response.data as any;

        if (!existingObject || !existingObject.textModulesData) {
            throw new Error("Loyalty Object not found or has no text modules");
        }

        // 6. Determine Tier Config based on newPoints
        const getTierConfig = (points: number) => {
            if (points >= 750) {
                return {
                    tierName: "Legend Member",
                    hexBackgroundColor: "#881337", // rose-900
                    heroImageUri: "https://placehold.co/1032x336/881337/FFFFFF/png?text=LEGEND+MEMBER", // Replace with real hosted image
                };
            } else if (points >= 500) {
                return {
                    tierName: "Gold Member",
                    hexBackgroundColor: "#CA8A04", // yellow-600
                    heroImageUri: "https://placehold.co/1032x336/CA8A04/FFFFFF/png?text=GOLD+MEMBER",
                };
            } else if (points >= 100) {
                return {
                    tierName: "Silver Member",
                    hexBackgroundColor: "#64748B", // slate-500
                    heroImageUri: "https://placehold.co/1032x336/64748B/FFFFFF/png?text=SILVER+MEMBER",
                };
            } else {
                return {
                    tierName: "Bronze Member",
                    hexBackgroundColor: "#44403C", // stone-700
                    heroImageUri: "https://placehold.co/1032x336/44403C/FFFFFF/png?text=BRONZE+MEMBER",
                };
            }
        };

        const tierConfig = getTierConfig(newPoints);
        console.log(`Setting Wallet Tier to: ${tierConfig.tierName} (${tierConfig.hexBackgroundColor})`);

        // 7. Update Points & Header Labels (Migration to Italian)
        const updatedTextModules = existingObject.textModulesData.map((module: any) => {
            // Update Points Label & Value
            if (["النقاط", "Points", "Punti"].includes(module.header)) {
                return {
                    ...module,
                    header: "Punti", // Force rename to Italian
                    body: newPoints.toString()
                };
            }
            // Update Name Label
            if (["الاسم", "Name", "Customer Name", "Nome"].includes(module.header)) {
                return {
                    ...module,
                    header: "Nome" // Force rename to Italian
                };
            }
            // Update Tier Label (if exists, or we might need to add it logic separately but let's assume it's one of the modules)
            if (["Tier", "Livello", "Stato"].includes(module.header)) {
                return {
                    ...module,
                    header: "Livello",
                    body: tierConfig.tierName
                };
            }
            return module;
        });

        // 8. PATCH the Object
        const patchBody: any = {
            textModulesData: updatedTextModules,
            // Force update barcode to CODE_128 with short ID
            barcode: {
                type: "CODE_128",
                value: customer.id.replace(/-/g, '').substring(0, 12).toUpperCase(), // Short ID for scanning
                alternateText: customer.id,
            },
            // Dynamic Branding based on Tier
            hexBackgroundColor: tierConfig.hexBackgroundColor,
            heroImage: {
                sourceUri: {
                    uri: tierConfig.heroImageUri
                },
                contentDescription: {
                    defaultValue: {
                        language: "en-US",
                        value: `${tierConfig.tierName} Banner`
                    }
                }
            },
            linksModuleData: {
                uris: [
                    {
                        uri: "https://elassali.netlify.app",
                        description: "Visita il sito",
                        id: "link_website"
                    },
                    {
                        uri: "tel:+391234567890",
                        description: "Chiama Baraka",
                        id: "link_phone"
                    }
                ]
            }
        };

        // Add message for push notification if provided
        if (customMessage) {
            console.log("Adding custom message:", customMessage);
            patchBody.messages = [{
                header: "Baraka Update", // Title of the notification
                body: customMessage,
                id: "msg_update", // Fixed ID to overwrite previous messages (prevents stacking)
                kind: "walletobjects#walletObjectMessage",
                messageType: "TEXT"
            }];
        } else {
            // Optional: Clear messages if none provided? 
            // Better to leave the last message or explicitly clear if desired.
            // patchBody.messages = []; 
        }

        console.log("Patching object with new points:", newPoints);

        const patchResponse = await client.request({
            url: objectUrl,
            method: "PATCH",
            data: patchBody,
        });

        console.log("--- Wallet Update Success ---");
        return { success: true, apiResponse: patchResponse.data };

    } catch (error: any) {
        console.error("--- Google Wallet Update Failed ---");
        // Log details if it's an axios/google error
        if (error.response) {
            console.error("API Error Status:", error.response.status);
            console.error("API Error Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error);
        }
        return { success: false, error: error.message || "Unknown error during update" };
    }
}
