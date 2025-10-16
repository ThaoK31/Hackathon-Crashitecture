import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);

// Créer le transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  // Ton mot de passe d'application ici
  }
});

// Configurer l'email
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'theos123@hotmail.fr',
  subject: 'Test d\'envoi avec Node.js',
  text: 'Ceci est un email de test envoyé depuis Node.js'
};

// Envoyer l'email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Erreur:', error);
  } else {
    console.log('Email envoyé:', info.response);
  }
});
