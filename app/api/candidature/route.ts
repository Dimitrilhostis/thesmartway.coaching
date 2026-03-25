import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const COACH_EMAIL = 'thesmartway.coaching@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    full_name, email, phone, sex, weight_kg, height_cm,
    goal, level, sports, availability,
    lifestyle, schedule, food_relation, medical,
    password,
  } = body

  if (!full_name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
  }

  const supabaseService = createServiceClient()

  // 1. Créer le compte Supabase Auth
  const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true, // pas besoin de confirmer l'email
    user_metadata: { full_name: full_name.trim() },
  })

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? 'Erreur création du compte.' },
      { status: 500 }
    )
  }

  const userId = authData.user.id

  // 2. Upsert profil users
  await supabaseService.from('users').upsert({
    id: userId,
    email: email.trim().toLowerCase(),
    full_name: full_name.trim(),
    role: 'client',
  })

  // 3. Créer le profil client
  await supabaseService.from('clients').insert({
    user_id: userId,
    phone: phone?.trim() ?? null,
    whatsapp_id: phone?.trim().replace(/\D/g, '') ?? null,
    goal: goal ?? null,
    status: 'active',
    weight_kg: weight_kg ? parseFloat(weight_kg) : null,
    height_cm: height_cm ? parseInt(height_cm) : null,
    notes_public: [
      sex          && `Sexe : ${sex}`,
      level        && `Niveau : ${level}`,
      sports       && `Sports : ${sports}`,
      availability && `Disponibilités : ${availability}`,
      lifestyle    && `Mode de vie : ${lifestyle}`,
      schedule     && `Emploi du temps : ${schedule}`,
      food_relation && `Relation à la nourriture : ${food_relation}`,
      medical      && `Antécédents médicaux : ${medical}`,
    ].filter(Boolean).join('\n'),
  })

  // 4. Créer une session pour connexion auto côté client
  const { data: sessionData } = await supabaseService.auth.admin.generateLink({
    type: 'magiclink',
    email: email.trim().toLowerCase(),
  })

  // ── EMAIL COACH ──
  const coachHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1C2B1C;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#7BAF6E;font-size:22px;margin:0;letter-spacing:2px">THE SMART WAY</h1>
        <p style="color:#8FA888;margin:6px 0 0;font-size:14px">Nouvelle candidature reçue</p>
      </div>
      <div style="background:#f9f9f9;padding:28px 32px;border-radius:0 0 12px 12px">
        <h2 style="font-size:18px;margin:0 0 20px;color:#1C2B1C">👤 ${full_name}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666;width:40%">Email</td><td style="padding:10px 0;font-weight:500"><a href="mailto:${email}" style="color:#4A6741">${email}</a></td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Téléphone</td><td style="padding:10px 0">${phone || '—'}</td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Sexe</td><td style="padding:10px 0">${sex || '—'}</td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Poids / Taille</td><td style="padding:10px 0">${weight_kg ? weight_kg + ' kg' : '—'} / ${height_cm ? height_cm + ' cm' : '—'}</td></tr>
        </table>
        <h3 style="font-size:14px;color:#4A6741;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px">🎯 Objectifs & Sport</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666;width:40%">Objectif</td><td style="padding:10px 0;font-weight:500">${goal || '—'}</td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Niveau</td><td style="padding:10px 0">${level || '—'}</td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Sports</td><td style="padding:10px 0">${sports || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Disponibilités</td><td style="padding:10px 0">${availability || '—'}</td></tr>
        </table>
        <h3 style="font-size:14px;color:#4A6741;margin:24px 0 12px;text-transform:uppercase;letter-spacing:1px">🌿 Mode de vie</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666;width:40%">Mode de vie</td><td style="padding:10px 0">${lifestyle || '—'}</td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Emploi du temps</td><td style="padding:10px 0">${schedule || '—'}</td></tr>
          <tr style="border-bottom:1px solid #e5e5e5"><td style="padding:10px 0;color:#666">Relation nourriture</td><td style="padding:10px 0">${food_relation || '—'}</td></tr>
          <tr><td style="padding:10px 0;color:#666">Antécédents</td><td style="padding:10px 0">${medical || '—'}</td></tr>
        </table>
        <div style="margin-top:28px;padding:16px;background:#EDF0E8;border-radius:8px;font-size:13px;color:#4A6741">
          ✅ Compte créé automatiquement — le client peut se connecter dès maintenant.
        </div>
      </div>
    </div>
  `

  // ── EMAIL CLIENT ──
  const clientHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1C2B1C;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#7BAF6E;font-size:22px;margin:0;letter-spacing:2px">THE SMART WAY</h1>
        <p style="color:#8FA888;margin:6px 0 0;font-size:14px">Bienvenue dans l'aventure 💪</p>
      </div>
      <div style="background:#f9f9f9;padding:28px 32px;border-radius:0 0 12px 12px">
        <h2 style="font-size:20px;margin:0 0 8px;color:#1C2B1C">Salut ${full_name.split(' ')[0]} !</h2>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0 0 20px">
          Ta candidature a bien été reçue. Le coach va l'étudier et te contacter très prochainement pour démarrer ton suivi personnalisé.<br><br>
          En attendant, ton espace est déjà prêt — tu peux t'y connecter dès maintenant.
        </p>

        <div style="text-align:center;margin:28px 0">
          <a href="${APP_URL}/espace" style="background:#4A6741;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:500;display:inline-block">
            Accéder à mon espace →
          </a>
        </div>

        <h3 style="font-size:14px;color:#4A6741;margin:28px 0 12px;text-transform:uppercase;letter-spacing:1px">📋 Ton récapitulatif</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;background:#fff;border-radius:8px;overflow:hidden">
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:9px 12px;color:#888;width:45%">Objectif</td><td style="padding:9px 12px;font-weight:500">${goal || '—'}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:9px 12px;color:#888">Niveau</td><td style="padding:9px 12px">${level || '—'}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:9px 12px;color:#888">Sports</td><td style="padding:9px 12px">${sports || '—'}</td></tr>
          <tr style="border-bottom:1px solid #f0f0f0"><td style="padding:9px 12px;color:#888">Disponibilités</td><td style="padding:9px 12px">${availability || '—'}</td></tr>
          <tr><td style="padding:9px 12px;color:#888">Poids / Taille</td><td style="padding:9px 12px">${weight_kg ? weight_kg + ' kg' : '—'} / ${height_cm ? height_cm + ' cm' : '—'}</td></tr>
        </table>

        <div style="margin-top:28px;padding:16px;background:#EDF0E8;border-radius:8px;font-size:13px;color:#4A6741;line-height:1.6">
          <strong>Prochaines étapes</strong><br>
          1. Le coach étudie ton profil<br>
          2. Il te contacte pour un bilan gratuit<br>
          3. Ton programme personnalisé est créé<br>
          4. C'est parti 🚀
        </div>

        <p style="font-size:12px;color:#aaa;margin-top:24px;text-align:center">
          The Smart Way · Coaching fitness & nutrition personnalisé
        </p>
      </div>
    </div>
  `

  try {
    await Promise.all([
      resend.emails.send({
        from: 'The Smart Way <onboarding@resend.dev>',
        to: COACH_EMAIL,
        replyTo: email,
        subject: `Nouveau client : ${full_name}`,
        html: coachHtml,
      }),
      resend.emails.send({
        from: 'The Smart Way <onboarding@resend.dev>',
        to: email,
        subject: 'Bienvenue sur The Smart Way 💪',
        html: clientHtml,
      }),
    ])
  } catch (err) {
    console.error('Resend error:', err)
    // On ne bloque pas — le compte est créé même si l'email échoue
  }

  return NextResponse.json({
    success: true,
    // On retourne l'email pour que le client se connecte côté browser
    email: email.trim().toLowerCase(),
    password, // utilisé uniquement pour la connexion auto immédiate
  })
}