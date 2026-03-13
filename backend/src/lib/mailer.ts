import { Resend } from "resend";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendSystemEmail(args: { to: string; subject: string; html: string; text?: string }) {
  const from = process.env.MAIL_FROM || "LkSGCompass <noreply@lksgcompass.local>";
  const client = getClient();
  if (!client) {
    console.warn(`[mail] skipped, RESEND_API_KEY missing -> ${args.subject} to ${args.to}`);
    return { skipped: true };
  }
  return client.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    text: args.text,
  });
}
