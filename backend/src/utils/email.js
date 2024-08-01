import nodemailer from "nodemailer";

/**
 * @function sendEmail
 * @description Send an email
 * @param {Object} options - Email options
 */
const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const messages = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(messages);

    return true;
  } catch (error) {
    return false;
  }
};

export default sendEmail;
