import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        // Remove any spaces from the app password just in case
        pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
    },
});

// Debug: Check if credentials are loaded (do not log the actual password)
console.log('Email Transporter Configured:');
console.log('- User:', process.env.GMAIL_USER ? process.env.GMAIL_USER : 'MISSING');
console.log('- Password Length:', process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.length : 'MISSING');


export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Baraka Admin" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};
