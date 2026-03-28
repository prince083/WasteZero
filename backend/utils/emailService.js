const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
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
