import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const client = new SendMailClient({
  url: process.env.ZEPTO_URL,
  token: process.env.ZEPTO_API_KEY,
});

/**
 * Sends an email using ZeptoMail.
 * @param {string} toEmail - Recipient email.
 * @param {string} toName - Recipient name.
 * @param {string} subject - Email subject.
 * @param {string} htmlBody - Email HTML content.
 */
const sendEmail = async (toEmail, toName, subject, htmlBody) => {
  try {
    const response = await client.sendMail({
      from: {
        address: process.env.ZEPTO_FROM_EMAIL,
        name: process.env.ZEPTO_FROM_NAME,
      },
      to: [
        {
          email_address: {
            address: toEmail,
            name: toName,
          },
        },
      ],
      subject,
      htmlbody: htmlBody,
    });

    console.log(`📧 Email sent successfully to ${toEmail}`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
    throw new Error("Email sending failed.");
  }
};

export default sendEmail;
