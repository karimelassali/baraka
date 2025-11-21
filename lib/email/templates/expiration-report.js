export const generateExpirationEmailHtml = (products) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const logoUrl = `${baseUrl}/logo.jpeg`;
    const currentDate = new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Group products by status
    const expired = products.filter(p => p.status === 'expired');
    const today = products.filter(p => p.status === 'today');
    const tomorrow = products.filter(p => p.status === 'tomorrow');
    const soon = products.filter(p => p.status === 'soon');

    const renderSection = (title, items, color) => {
        if (items.length === 0) return '';
        return `
      <div style="margin-bottom: 24px;">
        <h3 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 16px; font-family: sans-serif;">
          ${title} (${items.length})
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left;">
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 12px; text-transform: uppercase;">Prodotto</th>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 12px; text-transform: uppercase;">Scadenza</th>
              <th style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 12px; text-transform: uppercase;">Quantità</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px; color: #1f2937; font-weight: 500;">${item.name}</td>
                <td style="padding: 12px; color: ${color}; font-weight: bold;">
                  ${new Date(item.expiration_date).toLocaleDateString('it-IT')}
                </td>
                <td style="padding: 12px; color: #6b7280;">${item.quantity} ${item.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Report Scadenze Baraka</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 40px; margin-bottom: 40px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(to right, #dc2626, #991b1b); padding: 32px; text-align: center;">
          <img src="${logoUrl}" alt="Baraka Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.2); margin-bottom: 16px; object-fit: cover;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Report Scadenze</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${currentDate}</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Ciao Admin,<br><br>
            Ecco il riepilogo dei prodotti in scadenza nel tuo inventario. È richiesta la tua attenzione per i seguenti articoli:
          </p>

          ${renderSection('Scaduti', expired, '#dc2626')}
          ${renderSection('Scadono Oggi', today, '#ea580c')}
          ${renderSection('Scadono Domani', tomorrow, '#ca8a04')}
          ${renderSection('Scadono Presto (7gg)', soon, '#2563eb')}

          ${products.length === 0 ? `
            <div style="text-align: center; padding: 32px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
              <p style="color: #166534; font-weight: 500; margin: 0;">Ottimo! Non ci sono prodotti in scadenza imminente.</p>
            </div>
          ` : ''}

          <div style="margin-top: 32px; text-align: center;">
            <a href="${baseUrl}/admin/inventory" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Gestisci Inventario
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Baraka. Tutti i diritti riservati.<br>
            Questa è una notifica automatica, non rispondere a questa email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
