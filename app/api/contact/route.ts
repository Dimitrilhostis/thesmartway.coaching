import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_TO_EMAIL = 'thesmartway.coaching@gmail.com'
const CONTACT_FROM_EMAIL = 'The Smart Way <onboarding@resend.dev>'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const firstName = String(body?.firstName || '').trim()
    const lastName = String(body?.lastName || '').trim()
    const email = String(body?.email || '').trim()
    const phone = String(body?.phone || '').trim()
    const subject = String(body?.subject || '').trim()
    const message = String(body?.message || '').trim()

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Merci de remplir tous les champs obligatoires.' },
        { status: 400 }
      )
    }

    const safe = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="background:#1C2B1C;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#7BAF6E;font-size:22px;margin:0;letter-spacing:2px">THE SMART WAY</h1>
          <p style="color:#8FA888;margin:6px 0 0;font-size:14px">Nouveau message de contact</p>
        </div>

        <div style="background:#f9f9f9;padding:28px 32px;border-radius:0 0 12px 12px">
          <h2 style="font-size:18px;margin:0 0 20px;color:#1C2B1C">
            ${safe(firstName)} ${safe(lastName)}
          </h2>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr style="border-bottom:1px solid #e5e5e5">
              <td style="padding:10px 0;color:#666;width:40%">Email</td>
              <td style="padding:10px 0;font-weight:500">
                <a href="mailto:${safe(email)}" style="color:#4A6741">${safe(email)}</a>
              </td>
            </tr>
            <tr style="border-bottom:1px solid #e5e5e5">
              <td style="padding:10px 0;color:#666">Téléphone</td>
              <td style="padding:10px 0">${phone ? safe(phone) : '—'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#666">Type de demande</td>
              <td style="padding:10px 0">${safe(subject)}</td>
            </tr>
          </table>

          <h3 style="font-size:14px;color:#4A6741;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px">
            Message
          </h3>

          <div style="font-size:14px;line-height:1.7;color:#333;background:#fff;padding:16px;border-radius:10px;border:1px solid #ececec;white-space:pre-wrap;">
            ${safe(message)}
          </div>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Contact — ${subject} — ${firstName} ${lastName}`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: error.message || "Impossible d'envoyer le message." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API crash:', err)
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi du message." },
      { status: 500 }
    )
  }
}