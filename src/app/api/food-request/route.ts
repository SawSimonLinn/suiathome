import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendAdminNotification({
  foodName,
  country,
  userEmail,
  photoUrl,
}: {
  foodName: string;
  country: string;
  userEmail: string;
  photoUrl?: string | null;
}) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'hello@suiathome.com';
  const fromEmail = process.env.SMTP_FROM ?? smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('[food-request] SMTP not configured — skipping admin email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const safePhotoUrl = photoUrl ? escapeHtml(photoUrl) : null;
  const photoLine = safePhotoUrl
    ? `<p><strong>Photo:</strong> <a href="${safePhotoUrl}">${safePhotoUrl}</a></p>`
    : '';

  await transporter.sendMail({
    from: `"Sui at Home" <${fromEmail}>`,
    to: adminEmail,
    subject: `New Food Request: ${escapeHtml(foodName)}`,
    html: `
      <h2>New food request from a user</h2>
      <p><strong>Food:</strong> ${escapeHtml(foodName)}</p>
      <p><strong>Country:</strong> ${escapeHtml(country)}</p>
      <p><strong>From:</strong> ${escapeHtml(userEmail)}</p>
      ${photoLine}
    `,
  });
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !['pending', 'reviewed', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { error } = await supabase
      .from('food_requests')
      .update({ status })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[food-request PATCH]', err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { foodName, country, photoUrl } = body;

    if (!foodName?.trim() || !country?.trim()) {
      return NextResponse.json(
        { error: 'Food name and country are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('food_requests').insert({
      user_id: user.id,
      user_email: user.email,
      food_name: foodName.trim(),
      country: country.trim(),
      photo_url: photoUrl ?? null,
    });

    if (error) throw error;

    let emailError: string | null = null;
    try {
      await sendAdminNotification({
        foodName: foodName.trim(),
        country: country.trim(),
        userEmail: user.email ?? 'unknown',
        photoUrl,
      });
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
      console.error('[food-request] Email error:', err);
    }

    return NextResponse.json({ success: true, emailError });
  } catch (err) {
    console.error('[food-request POST]', err);
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}
