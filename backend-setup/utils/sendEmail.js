const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Créer un transporteur
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Options du message
  const mailOptions = {
    from: `RecyTrack <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #22c55e; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">RecyTrack</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <p style="color: #333; line-height: 1.6; white-space: pre-line;">
            ${options.message}
          </p>
        </div>
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} RecyTrack. Tous droits réservés.</p>
        </div>
      </div>
    `
  };

  // Envoyer l'email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw new Error('Erreur lors de l\'envoi de l\'email');
  }
};

module.exports = sendEmail;