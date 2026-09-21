import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, title, message, orderId, total, items, freeGift } = body;

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER;
    const pass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
    const fromName = process.env.SMTP_FROM_NAME || 'Tienda Táctica Cochabamba';

    if (!user || !pass) {
      return NextResponse.json(
        {
          error: 'Credenciales SMTP de Google no configuradas en variables de entorno (SMTP_USER / SMTP_PASSWORD).',
        },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransporter({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass, // Google App Password (16 characters without spaces)
      },
    });

    // Dark Tactical Gold HTML Email Template
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #050507; color: #F5F5F7; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background-color: #0c0c10; border: 1px solid rgba(200, 169, 97, 0.3); border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #14141a 0%, #0c0c10 100%); padding: 28px; border-bottom: 1px solid #22222a; text-align: center; }
        .badge { display: inline-block; background: rgba(200, 169, 97, 0.15); color: #C8A961; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: bold; letter-spacing: 1px; }
        .title { color: #ffffff; font-size: 22px; font-weight: 800; text-transform: uppercase; margin: 12px 0 4px 0; }
        .body-content { padding: 28px; }
        .text { color: #A1A1AA; font-size: 14px; line-height: 1.6; }
        .order-box { background-color: #14141a; border: 1px solid #22222a; border-radius: 12px; padding: 18px; margin: 20px 0; }
        .order-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #1f1f26; }
        .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #DEC07A; padding-top: 10px; }
        .gift-box { background: rgba(48, 164, 108, 0.12); border: 1px solid rgba(48, 164, 108, 0.3); border-radius: 10px; padding: 12px; margin: 16px 0; color: #30A46C; font-size: 13px; }
        .footer { background-color: #07070a; padding: 20px; border-top: 1px solid #22222a; text-align: center; font-size: 11px; color: #5E5E68; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="badge">TIENDA TÁCTICA COCHABAMBA · DESPACHO OFICIAL</span>
          <h1 class="title">${title || 'COMUNICADO OPERATIVO'}</h1>
          <p style="color: #7A7A85; font-size: 12px; margin: 0;">STANAG 4569 · BASE HEROÍNAS #560</p>
        </div>
        <div class="body-content">
          <p class="text">${message || 'Notificación oficial sobre tu orden o cuenta en Tienda Táctica Bolivia.'}</p>
          
          ${orderId ? `
            <div class="order-box">
              <div style="font-size: 11px; color: #C8A961; font-weight: bold; margin-bottom: 8px;">CÓDIGO DE ORDEN: ${orderId}</div>
              ${total ? `<div class="total-row"><span>Total Orden:</span><span>Bs. ${Number(total).toFixed(2)}</span></div>` : ''}
            </div>
          ` : ''}

          ${freeGift ? `
            <div class="gift-box">
              <strong>🎁 Souvenir Táctico Sorpresa Incluido:</strong> Por haber realizado el abono del 100% mediante QR Simple, viaja un souvenir exclusivo dentro de tu paquete.
            </div>
          ` : ''}

          <p class="text" style="font-size: 12px; margin-top: 24px;">
            Para coordinar entrega o soporte inmediato, comunícate al WhatsApp de operaciones: <strong>+591 71234567</strong>.
          </p>
        </div>
        <div class="footer">
          © 2026 Tienda Táctica Cochabamba · Av. Heroínas #560 · Bolivia
        </div>
      </div>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to,
      subject: subject || 'Notificación Oficial — Tienda Táctica Bolivia',
      html,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending email with Google SMTP:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
