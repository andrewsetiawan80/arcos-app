import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { fireWebhook } from './webhooks';
import { createNotification } from './notifications';
import { getMailConfig } from './mailSettings';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions. Try again later.' },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const contactSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

// POST /api/contact — send contact form email
router.post('/', contactLimiter, async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, company, message } = contactSchema.parse(req.body);
    const safe = {
      fullName: escapeHtml(fullName),
      email: escapeHtml(email),
      phone: phone ? escapeHtml(phone) : '',
      company: company ? escapeHtml(company) : '',
      message: escapeHtml(message),
    };

    // Build email (use raw values for subject, safe for HTML body)
    const subject = `[ARCOS Contact] New inquiry from ${fullName}`;
    const html = `
    <h2>New Contact Form Submission</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:6px 12px;font-weight:bold;">Name</td><td style="padding:6px 12px;">${safe.fullName}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Email</td><td style="padding:6px 12px;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
      ${safe.phone ? `<tr><td style="padding:6px 12px;font-weight:bold;">Phone</td><td style="padding:6px 12px;">${safe.phone}</td></tr>` : ''}
      ${safe.company ? `<tr><td style="padding:6px 12px;font-weight:bold;">Company</td><td style="padding:6px 12px;">${safe.company}</td></tr>` : ''}
    </table>
    <h3>Message</h3>
    <p style="white-space:pre-wrap;">${safe.message}</p>
  `;

  // Use DB settings (editable in GUI) with env fallback
  const { host, port, user, pass, toEmail } = await getMailConfig();

  if (!user || !pass) {
    // No SMTP configured — log and return success anyway (so form works)
    console.log('⚠️  SMTP not configured. Contact form submission:');
    console.log({ fullName, email, phone, company, message });
    fireWebhook('contact.new', { fullName, email, phone: phone ?? '', company: company ?? '', message }).catch(() => {});
    createNotification('contact', `New contact from ${fullName}`, message).catch(() => {});
    return res.json({ success: true, note: 'Email not sent (SMTP not configured). Logged to console.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"ARCOS Website" <${user}>`,
      to: toEmail || user || 'info@arcosworks.com',
      replyTo: email,
      subject,
      html,
    });

    fireWebhook('contact.new', { fullName, email, phone: phone ?? '', company: company ?? '', message }).catch(() => {});
    createNotification('contact', `New contact from ${fullName}`, message).catch(() => {});

    res.json({ success: true });
  } catch (innerErr: any) {
    console.error('Email send error:', innerErr);
    res.status(500).json({ error: 'Failed to send email' });
  }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    throw err;
  }
});

export default router;
