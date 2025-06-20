import nodemailer from "nodemailer";

const { SMTP_ENDPOINT, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL } = process.env;

if (!SMTP_ENDPOINT || !SMTP_PORT || !SMTP_USERNAME || !SMTP_PASSWORD || !FROM_EMAIL) {
  throw new Error("One or more required environment variables for email are not set.");
}

const transport = nodemailer.createTransport({
  host: SMTP_ENDPOINT,
  port: parseInt(SMTP_PORT, 10),
  secure: false,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, body: string) {
    await transport.sendMail({
        from: FROM_EMAIL,
        sender: FROM_EMAIL,
        to,
        subject: "Hello from Integrix",
        text: body
    })
}