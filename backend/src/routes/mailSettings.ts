import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import pool from '../db/client';

const router = Router();
router.use(authenticateToken);

const KEYS = ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'contact_email'] as const;

async function getSettings(): Promise<Record<string, string>> {
  const result = await pool.query(
    "SELECT key, value FROM app_settings WHERE key = ANY($1)",
    [KEYS]
  );
  const map: Record<string, string> = {};
  for (const row of result.rows) {
    map[row.key] = row.value || '';
  }
  return map;
}

// GET /api/settings/mail
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const env = process.env;
    const db = await getSettings();

    const smtpHost = db.smtp_host || env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(db.smtp_port || env.SMTP_PORT || '587', 10);
    const smtpUser = db.smtp_user || env.SMTP_USER || '';
    const smtpPass = db.smtp_pass || env.SMTP_PASS || '';
    const contactEmail = db.contact_email || env.CONTACT_EMAIL || smtpUser || 'info@arcosworks.com';

    res.json({
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass: smtpPass ? '••••••••' : '', // always mask in GET
      contactEmail,
    });
  } catch (err) {
    console.error('Get mail settings error:', err);
    res.status(500).json({ error: 'Failed to fetch mail settings' });
  }
});

// PUT /api/settings/mail
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, contactEmail } = req.body;

    const updates: { key: string; value: string }[] = [
      { key: 'smtp_host', value: String(smtpHost || '').trim() },
      { key: 'smtp_port', value: String(smtpPort || '587').trim() },
      { key: 'smtp_user', value: String(smtpUser || '').trim() },
      { key: 'contact_email', value: String(contactEmail || '').trim() },
    ];

    if (smtpPass && smtpPass !== '••••••••') {
      updates.push({ key: 'smtp_pass', value: String(smtpPass).trim() });
    }

    for (const { key, value } of updates) {
      await pool.query(
        `INSERT INTO app_settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Save mail settings error:', err);
    res.status(500).json({ error: 'Failed to save mail settings' });
  }
});

export default router;

// Helper for contact route: get effective SMTP config (DB overrides env)
export async function getMailConfig(): Promise<{
  host: string;
  port: number;
  user: string;
  pass: string;
  toEmail: string;
}> {
  const env = process.env;
  const db = await getSettings();

  return {
    host: db.smtp_host || env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(db.smtp_port || env.SMTP_PORT || '587', 10),
    user: db.smtp_user || env.SMTP_USER || '',
    pass: db.smtp_pass || env.SMTP_PASS || '',
    toEmail: db.contact_email || env.CONTACT_EMAIL || env.SMTP_USER || 'info@arcosworks.com',
  };
}
