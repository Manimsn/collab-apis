import { SendMailClient } from "zeptomail";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const client = new SendMailClient({
  url: process.env.ZEPTO_URL,
  token: process.env.ZEPTO_API_KEY,
});

/**
 * Sends an email using ZeptoMail's template.
 * @param {string} toEmail - Recipient email.
 * @param {string} toName - Recipient name.
 * @param {string} templateKey - ZeptoMail template key.
 * @param {object} mergeInfo - Merge information for the template.
 */
const sendEmail = async (toEmail, toName, templateKey, mergeInfo = {}) => {
  try {
    const response = await client.sendMailWithTemplate({
      mail_template_key: process.env.ZEPTO_MAIL_TEMPLATE_KEY,
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
      merge_info: mergeInfo,
    });

    console.log(`📧 Email sent successfully to ${toEmail}`);
    return response;
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
    throw new Error("Email sending failed.");
  }
};

export default sendEmail;
