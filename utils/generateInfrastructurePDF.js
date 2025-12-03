import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInfrastructurePDF = async () => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = [220, 38, 38]; // Red-600
    const secondaryColor = [75, 85, 99]; // Gray-600
    const lightGray = [243, 244, 246]; // Gray-100

    // Helper to load image
    const loadImage = (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    };

    try {
        // Add Logo
        const logo = await loadImage('/logo.jpeg');
        doc.addImage(logo, 'JPEG', 15, 15, 25, 25);
    } catch (e) {
        console.error("Could not load logo", e);
    }

    // Header
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('BARAKA', 45, 25);

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Infrastructure & Service Charges', 45, 32);

    // Date
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Date: ${date}`, 195, 25, { align: 'right' });

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Infrastructure Cost Breakdown', 15, 55);

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Detailed breakdown of third-party services and maintenance costs.', 15, 62);

    // Table Data
    const tableData = [
        [
            'Supabase',
            'Database & Backend Infrastructure',
            'High-performance PostgreSQL database, real-time subscriptions, authentication services, and automated backups.',
            '$25.00 / mo'
        ],
        [
            'Vercel',
            'Global Hosting & CDN',
            'Premium frontend hosting with global Edge Network, serverless functions, and instant deployments for maximum speed.',
            '$20.00 / mo'
        ],
        [
            'Twilio',
            'Multi-channel Messaging (SMS & WhatsApp)',
            'SMS (Italy): ~$0.0927 per standard SMS (approx. 160 chars). WhatsApp: ~$0.005 Twilio fee + Meta fees per template. Costs depend on volume.',
            '~$92.70 / 1,000 SMS'
        ],
        [
            'Domain Services (.it)',
            'DNS & SSL Management',
            'Annual registration for .it domain. Recommended providers: Dynadot or Cloudflare for best rates.',
            '~$8.00 / yr'
        ]
    ];

    // Generate Table
    autoTable(doc, {
        startY: 70,
        head: [['Service', 'Category', 'Description', 'Estimated Cost']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 4
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 30 }, // Service
            1: { cellWidth: 40 }, // Category
            2: { cellWidth: 'auto' }, // Description
            3: { halign: 'right', fontStyle: 'bold', cellWidth: 30 } // Cost
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            valign: 'middle',
            overflow: 'linebreak'
        },
        alternateRowStyles: {
            fillColor: lightGray
        }
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text('This document outlines the direct infrastructure costs required to operate the platform.', 105, pageHeight - 15, { align: 'center' });
    doc.text('Prices for third-party services (Supabase, Vercel, Twilio) are subject to their respective pricing policies.', 105, pageHeight - 10, { align: 'center' });

    // Save
    doc.save('Baraka_Infrastructure_Costs.pdf');
};
