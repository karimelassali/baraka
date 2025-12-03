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
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Infrastruttura e Costi di Servizio', 45, 32);

    // Date
    const date = new Date().toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Data: ${date}`, 195, 25, { align: 'right' });

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Ripartizione Costi Infrastruttura', 15, 55);

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');
    doc.text('Ripartizione dettagliata dei servizi di terze parti e dei costi di manutenzione.', 15, 62);

    // Table Data
    const tableData = [
        [
            'Supabase',
            'Database e Infrastruttura Backend',
            'Database PostgreSQL ad alte prestazioni, sottoscrizioni in tempo reale, servizi di autenticazione e backup automatici.',
            '$25.00 / mese'
        ],
        [
            'Vercel',
            'Hosting Globale e CDN',
            'Hosting frontend premium con Edge Network globale, funzioni serverless e deploy istantanei per la massima velocità.',
            '$20.00 / mese'
        ],
        [
            'Twilio',
            'Messaggistica Multicanale (SMS e WhatsApp)',
            'SMS (Italia): ~$0.0927 per SMS standard (circa 160 car.). WhatsApp: ~$0.005 tariffa Twilio + tariffe Meta per template. I costi dipendono dal volume.',
            '~$92.70 / 1,000 SMS'
        ],
        [
            'Domain Services (.it)',
            'Gestione DNS e SSL',
            'Registrazione annuale per dominio .it. Provider consigliati: Dynadot o Cloudflare per le migliori tariffe.',
            '~$8.00 / anno'
        ]
    ];

    // Generate Table
    autoTable(doc, {
        startY: 70,
        head: [['Servizio', 'Categoria', 'Descrizione', 'Costo Stimato']],
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
    doc.text('Questo documento delinea i costi diretti dell\'infrastruttura necessari per operare la piattaforma.', 105, pageHeight - 15, { align: 'center' });
    doc.text('I prezzi per i servizi di terze parti (Supabase, Vercel, Twilio) sono soggetti alle rispettive politiche di prezzo.', 105, pageHeight - 10, { align: 'center' });

    // Save
    doc.save('Baraka_Infrastructure_Costs.pdf');
};
