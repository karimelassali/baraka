
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateRevenuePDF = async (data, month, year) => {
    const doc = new jsPDF();

    // Colors - Red Theme
    const primaryColor = [220, 38, 38]; // Red-600
    const lightRed = [254, 242, 242]; // Red-50
    const textColor = [30, 41, 59]; // Slate-800

    const monthName = new Date(year, month - 1).toLocaleString('it-IT', { month: 'long' });

    // Load Logo
    try {
        const logoUrl = '/logo.jpeg';
        const logoImage = await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = logoUrl;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });

        // Add Logo (Top Left)
        doc.addImage(logoImage, 'JPEG', 14, 10, 20, 20);

        // Header Text (Next to Logo)
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.text("BARAKA", 40, 22);

        doc.setFontSize(14);
        doc.setTextColor(...textColor);
        doc.text(`Rapporto Mensile Entrate – ${monthName} ${year}`, 40, 30);

    } catch (error) {
        console.error("Error loading logo:", error);
        // Fallback if logo fails
        doc.setFontSize(24);
        doc.setTextColor(...primaryColor);
        doc.text("BARAKA", 14, 20);

        doc.setFontSize(14);
        doc.setTextColor(...textColor);
        doc.text(`Rapporto Mensile Entrate – ${monthName} ${year}`, 14, 30);
    }

    // Table Data
    const tableColumn = ["Data", "Entrate Totali", "Contanti", "Carta", "Ticket"];
    const tableRows = [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedData.forEach(entry => {
        const revenueData = [
            new Date(entry.date).toLocaleDateString('it-IT'),
            `€${Number(entry.total_revenue).toFixed(2)}`,
            `€${Number(entry.cash).toFixed(2)}`,
            `€${Number(entry.card).toFixed(2)}`,
            `€${Number(entry.ticket).toFixed(2)}`,
        ];
        tableRows.push(revenueData);
    });

    // Calculate Totals
    const totalRevenue = data.reduce((sum, item) => sum + Number(item.total_revenue), 0);
    const totalCash = data.reduce((sum, item) => sum + Number(item.cash), 0);
    const totalCard = data.reduce((sum, item) => sum + Number(item.card), 0);
    const totalTicket = data.reduce((sum, item) => sum + Number(item.ticket), 0);

    // Add Totals Row
    tableRows.push([
        "TOTALI",
        `€${totalRevenue.toFixed(2)}`,
        `€${totalCash.toFixed(2)}`,
        `€${totalCard.toFixed(2)}`,
        `€${totalTicket.toFixed(2)}`
    ]);

    // Generate Table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: lightRed, textColor: textColor, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold' }, // Date column
            1: { halign: 'right', fontStyle: 'bold' }, // Total column
            2: { halign: 'right' },
            3: { halign: 'right' },
            4: { halign: 'right' },
        },
        didParseCell: function (data) {
            if (data.row.index === tableRows.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = lightRed;
            }
        }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Pagina ${i} di ${pageCount}`, 105, 290, { align: "center" });
        doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 200, 290, { align: "right" });
    }

    doc.save(`Revenue_Report_${monthName}_${year}.pdf`);
};
