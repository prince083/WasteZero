const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    family: 4, // Forces IPv4 to avoid ENETUNREACH issues on cloud servers
    connectionTimeout: 10000, // 10 seconds
});

async function sendVerificationEmail(email, otp, subject) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
