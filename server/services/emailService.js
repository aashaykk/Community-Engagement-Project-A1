const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text, html = null) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL || 'noreply@vjti.ac.in',
    subject,
    text,
    ...(html && { html })
  };
  await sgMail.send(msg);
}

module.exports = { sendEmail };
