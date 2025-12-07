import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateEidPdf = async ({ title, columns, data, filename, details = {}, colorColumnIndex = null, multiTable = false }) => {
    const doc = new jsPDF();

    // Load Logo
    const logoUrl = '/logo.jpeg';
    let logoImg = null;

    try {
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve) => {
            img.onload = () => { logoImg = img; resolve(); };
            img.onerror = () => { console.warn('Logo failed to load'); resolve(); };
        });
    } catch (e) {
        console.error("Error loading logo", e);
    }

    const drawHeader = (doc, pageTitle, pageDetails = {}) => {
        if (logoImg) {
            doc.addImage(logoImg, 'JPEG', 14, 10, 25, 25);
        }

        doc.setFontSize(20);
        doc.setTextColor(185, 28, 28); // Red-700
        doc.text("Baraka Eid Al-Adha", 45, 20);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(pageTitle, 45, 28);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        const dateStr = new Date().toLocaleDateString('it-IT', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        doc.text(`Generated: ${dateStr}`, 45, 34);

        if (Object.keys(pageDetails).length > 0) {
            doc.setFontSize(9);
            let y = 20;
            Object.entries(pageDetails).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, 196, y, { align: 'right' });
                y += 5;
            });
        }
    };

    const drawFooter = (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

        doc.setFontSize(8);
        doc.setTextColor(150);
        const footerText = 'Baraka Macelleria - Via Casilina 123, Roma';
        doc.text(footerText, 105, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${data.pageNumber}`, 196, pageHeight - 10, { align: 'right' });
    };

    const commonTableOptions = {
        theme: 'grid',
        headStyles: {
            fillColor: [185, 28, 28],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        alternateRowStyles: { fillColor: [254, 242, 242] },
        styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
        didDrawPage: drawFooter,
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === colorColumnIndex) {
                const color = data.cell.raw;
                if (color && typeof color === 'string' && color.startsWith('#')) {
                    doc.setFillColor(color);
                    doc.rect(data.cell.x + 2, data.cell.y + 2, 15, 5, 'F');
                    data.cell.text = ''; // Hide the hex code
                }
            }
        }
    };

    if (multiTable && Array.isArray(data)) {
        // data is array of { title, details, rows }
        for (let i = 0; i < data.length; i++) {
            const groupData = data[i];

            if (i > 0) doc.addPage();

            // Draw header for each page/group
            drawHeader(doc, title, { ...details, ...groupData.details });

            // Subtitle for the group
            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.text(groupData.title, 14, 45);

            autoTable(doc, {
                ...commonTableOptions,
                head: [columns],
                body: groupData.rows,
                startY: 50,
                didDrawPage: (d) => {
                    // Only draw footer, header is manually drawn
                    drawFooter(d);
                }
            });
        }
    } else {
        drawHeader(doc, title, details);
        autoTable(doc, {
            ...commonTableOptions,
            head: [columns],
            body: data,
            startY: 45
        });
    }

    doc.save(`${filename}.pdf`);
};
