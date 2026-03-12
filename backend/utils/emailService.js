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
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: `Your OTP verification code is: ${otp}. This code is valid for 10 minutes.`
    };
    try {
        await transporter.sendMail(mailOptions);

        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Email could not be sent");
    }
}

module.exports = sendVerificationEmail;
