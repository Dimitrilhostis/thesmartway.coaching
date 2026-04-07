// app/api/booking/route.ts
// POST /api/booking — crée la réservation + envoie les mails

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  })
}

// Génère un fichier .ics minimal
function generateICS(booking: {
  serviceName: string
  clientName: string
  startsAt: string
  endsAt: string
  location?: string
}) {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, '').replace('.000', '')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Smart Way//Booking//FR',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@thesmartway.fr`,
    `DTSTAMP:${fmt(new Date().toISOString())}`,
    `DTSTART:${fmt(booking.startsAt)}`,
    `DTEND:${fmt(booking.endsAt)}`,
    `SUMMARY:${booking.serviceName}`,
    `DESCRIPTION:Réservation confirmée pour ${booking.clientName}`,
    `LOCATION:${booking.location ?? 'The Smart Way'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export async function POST(req: Request) {
  const body = await req.json()
  const { serviceId, startsAt, endsAt, clientName, clientEmail, clientPhone, notes } = body

  if (!serviceId || !startsAt || !endsAt || !clientName || !clientEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  // Récupérer l'user connecté si dispo
  const { data: { user } } = await supabase.auth.getUser()

  // ── 1. Vérifier que le créneau est toujours libre ─────────
  const { data: conflict } = await supabase
    .from('bookings')
    .select('id')
    .neq('status', 'cancelled')
    .or(`starts_at.lt.${endsAt},ends_at.gt.${startsAt}`)
    .eq('service_id', serviceId)
    .maybeSingle()

  if (conflict) {
    return NextResponse.json({ error: 'Ce créneau n\'est plus disponible.' }, { status: 409 })
  }

  // ── 2. Récupérer la prestation ────────────────────────────
  const { data: service } = await supabase
    .from('massage_services')
    .select('name, price_cents')
    .eq('id', serviceId)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service introuvable.' }, { status: 404 })
  }

  // ── 3. Créer la réservation ───────────────────────────────
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      service_id:   serviceId,
      user_id:      user?.id ?? null,
      client_name:  clientName,
      client_email: clientEmail,
      client_phone: clientPhone ?? null,
      starts_at:    startsAt,
      ends_at:      endsAt,
      status:       'confirmed',
      confirmed_at: new Date().toISOString(),
      notes:        notes ?? null,
    })
    .select()
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: error?.message ?? 'Erreur création.' }, { status: 500 })
  }

  // ── 4. Générer le .ics ────────────────────────────────────
  const icsContent = generateICS({
    serviceName: service.name,
    clientName,
    startsAt,
    endsAt,
  })
  const icsBase64 = Buffer.from(icsContent).toString('base64')

  // ── 5. Mail client ────────────────────────────────────────
  const dateLabel = formatDate(startsAt)
  const timeLabel = formatTime(startsAt)
  const timeEndLabel = formatTime(endsAt)

  await resend.emails.send({
    from:    'The Smart Way <no-reply@thesmartway.fr>',
    to:      clientEmail,
    subject: `Votre réservation est confirmée — ${dateLabel}`,
    attachments: [{
      filename: 'reservation.ics',
      content:  icsBase64,
    }],
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
        <h2 style="margin-bottom:4px">Réservation confirmée</h2>
        <p style="color:#666;margin-top:0">Bonjour ${clientName},</p>
        <div style="background:#f5f5f0;border-radius:12px;padding:20px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>${service.name}</strong></p>
          <p style="margin:0 0 4px;color:#444">${dateLabel}</p>
          <p style="margin:0;color:#444">${timeLabel} — ${timeEndLabel}</p>
        </div>
        <p style="color:#666;font-size:14px">
          Le fichier joint vous permet d'ajouter ce rendez-vous à votre agenda.<br>
          Règlement sur place. En cas d'empêchement, merci de nous prévenir 24h à l'avance.
        </p>
        <p style="color:#666;font-size:14px">À bientôt,<br><strong>The Smart Way</strong></p>
      </div>
    `,
  })

  // ── 6. Mail admin ─────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await resend.emails.send({
      from:    'The Smart Way <no-reply@thesmartway.fr>',
      to:      adminEmail,
      subject: `Nouvelle réservation — ${dateLabel} ${timeLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2>Nouvelle réservation</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#666">Client</td><td><strong>${clientName}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#666">Email</td><td>${clientEmail}</td></tr>
            ${clientPhone ? `<tr><td style="padding:6px 0;color:#666">Téléphone</td><td>${clientPhone}</td></tr>` : ''}
            <tr><td style="padding:6px 0;color:#666">Prestation</td><td>${service.name}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Date</td><td>${dateLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Horaire</td><td>${timeLabel} — ${timeEndLabel}</td></tr>
            ${notes ? `<tr><td style="padding:6px 0;color:#666">Notes</td><td>${notes}</td></tr>` : ''}
          </table>
        </div>
      `,
    })
  }

  return NextResponse.json({ booking }, { status: 201 })
}