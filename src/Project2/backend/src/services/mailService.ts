
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  const mailOptions = {
    from: '"Focus Companion" <no-reply@focuscompanion.com>',
    to,
    subject: 'Verify your Focus Companion account',
    text: `Welcome! Please verify your account by clicking: ${verificationUrl}`,
    html: `<h1>Welcome!</h1><p>Please verify your account by clicking the link below:</p><a href="${verificationUrl}">Verify Account</a>`,
  };

  try {
    if (!process.env.SMTP_HOST) {
      console.log('------------------------------------');
      console.log('📧 DEVELOPMENT MODE: Verification Email');
      console.log(`To: ${to}`);
      console.log(`Link: ${verificationUrl}`);
      console.log('------------------------------------');
      return;
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send failed:', error);
  }
};
