const dns = require('dns');
// CRITICAL: Force IPv4 DNS resolution globally.
// Render free tier has broken IPv6, so without this,
// smtp.gmail.com resolves to an IPv6 address (ENETUNREACH error).
dns.setDefaultResultOrder('ipv4first');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendVerificationEmail(email, otp, subject) {
    const mailOptions = {
        from: `WasteZero <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: `Your OTP verification code is: ${otp}. This code is valid for 10 minutes.`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error("Nodemailer Error Details:", error.message, error.stack);
        throw new Error("Email could not be sent: " + error.message);
    }
}

module.exports = sendVerificationEmail;


// -----------------------------------------------------------------------
// RESEND CODE (Commented out - caused '404 User not found' issue)
// -----------------------------------------------------------------------
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API);
// async function sendVerificationEmail(email, otp, subject) {
//     const { data, error } = await resend.emails.send({
//         from: 'WasteZero <onboarding@resend.dev>',
//         to: [email],
//         subject: subject,
//         text: `Your OTP is: ${otp}. Valid for 10 minutes.`,
//     });
//     if (error) {
//         console.error('Resend Error Details:', error);
//         throw new Error('Email could not be sent: ' + error.message);
//     }
//     console.log(`Email sent to ${email}, ID: ${data.id}`);
// }
