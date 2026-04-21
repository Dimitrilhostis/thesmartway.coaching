import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const COACH_EMAIL = 'thesmartway.coaching@gmail.com'

// ─── LABEL MAPS ────────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  confident:  'Confiance & Aura',
  healthy:    'Healthy & No stress',
  productive: 'Productivité & Clarté',
  global:     'Meilleur dans tout',
}

const COMMITMENT_LABELS: Record<string, string> = {
  '5': '5 - À FOND !',
  '4': '4 - Carrément',
  '3': '3 - Ça va',
  '2': '2 - Pas tant',
  '1': '1 - Pas du tout',
}

const LEVEL_LABELS: Record<string, string> = {
  '1': '1 - Non Sportif',
  '2': '2 - Sportif Débutant',
  '3': '3 - Sportif Loisir',
  '4': '4 - Sportif de Compétition',
  '5': '5 - Athlète',
}

const SLEEP_QUALITY_LABELS: Record<string, string> = {
  '1': '1 - Un cauchemar',
  '2': '2 - Compliqué',
  '3': '3 - Basique',
  '4': '4 - Réveil en forme',
  '5': '5 - Comme un bébé',
}

// ─── ROUTE ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      // Identité
      identity,
      age,
      situation,
      sex,
      poids,
      taille,

      // Organisation
      job,
      time_extra,
      equipment,

      // Sport
      level,
      injuries,
      sports,

      // Sommeil
      sleep_hours,
      sleep_quality,
      sleep_schedule,

      // Nutrition
      meals,
      food_quality,
      cravings,

      // Objectif
      goal,

      // Engagement
      why,
      commitment,
      quitting,

      // Vision
      short_goal,
      dream,
      why_me,

      // Contact
      email,
      number,
    } = body

    // ── Validation basique ────────────────────────────────────────────────────
    if (!identity?.trim()) {
      return NextResponse.json({ error: 'Nom requis.' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // ── 1. INSERT dans la table candidatures ─────────────────────────────────
    // (pas besoin de créer un faux compte auth)
    const { error: insertError } = await supabase
      .from('candidatures')
      .insert({
        // Identité
        full_name:     identity,
        email,
        phone:         number     ?? null,
        age:           age        ?? null,
        situation:     situation  ?? null,
        sex:           sex        ?? null,
        poids:         poids      ?? null,
        taille:        taille     ?? null,

        // Organisation
        job:           job        ?? null,
        time_extra:    time_extra ?? null,
        equipment:     equipment  ?? null,

        // Sport
        level:         level      ?? null,
        injuries:      injuries   ?? null,
        sports:        sports     ?? null,

        // Sommeil
        sleep_hours:   sleep_hours    ?? null,
        sleep_quality: sleep_quality  ?? null,
        sleep_schedule:sleep_schedule ?? null,

        // Nutrition
        meals:         meals       ?? null,
        food_quality:  food_quality ?? null,
        cravings:      cravings    ?? null,

        // Objectif & Engagement
        goal:          goal       ?? null,
        why:           why        ?? null,
        commitment:    commitment ?? null,
        quitting:      quitting   ?? null,

        // Vision
        short_goal:    short_goal ?? null,
        dream:         dream      ?? null,
        why_me:        why_me     ?? null,

        // Statut
        status: 'new',
      })

    if (insertError) {
      console.error('CANDIDATURE INSERT ERROR:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // ── 2. EMAIL → COACH (toutes les infos) ──────────────────────────────────
    const goalLabel = GOAL_LABELS[goal] ?? goal ?? '—'

    const coachHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;color:#1a1a1a">
        <h2 style="color:#2d6a4f">🏋️ Nouvelle candidature : ${identity}</h2>

        <table style="width:100%;border-collapse:collapse">

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">👤 Identité</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Nom</td><td style="padding:4px 8px">${identity}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Email</td><td style="padding:4px 8px">${email}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Téléphone</td><td style="padding:4px 8px">${number || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Âge</td><td style="padding:4px 8px">${age || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Situation</td><td style="padding:4px 8px">${situation || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Sexe</td><td style="padding:4px 8px">${sex || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Poids</td><td style="padding:4px 8px">${poids || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Taille</td><td style="padding:4px 8px">${taille || '—'}</td></tr>

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">📅 Organisation</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Job</td><td style="padding:4px 8px">${job || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Temps dispo</td><td style="padding:4px 8px">${time_extra || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Matériel</td><td style="padding:4px 8px">${equipment || '—'}</td></tr>

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">🏃 Sport</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Niveau</td><td style="padding:4px 8px">${LEVEL_LABELS[level] ?? level ?? '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Blessures</td><td style="padding:4px 8px">${injuries || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Sports</td><td style="padding:4px 8px">${sports || '—'}</td></tr>

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">😴 Sommeil</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Heures / nuit</td><td style="padding:4px 8px">${sleep_hours || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Qualité</td><td style="padding:4px 8px">${SLEEP_QUALITY_LABELS[sleep_quality] ?? sleep_quality ?? '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Coucher</td><td style="padding:4px 8px">${sleep_schedule || '—'}</td></tr>

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">🥗 Nutrition</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Repas / jour</td><td style="padding:4px 8px">${meals || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Repas type</td><td style="padding:4px 8px">${food_quality || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Craquages</td><td style="padding:4px 8px">${cravings || '—'}</td></tr>

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">🎯 Objectif & Engagement</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Objectif</td><td style="padding:4px 8px">${goalLabel}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Pourquoi</td><td style="padding:4px 8px">${why || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Engagement</td><td style="padding:4px 8px">${COMMITMENT_LABELS[commitment] ?? commitment ?? '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Abandons</td><td style="padding:4px 8px">${quitting || '—'}</td></tr>

          <tr><td colspan="2" style="padding:8px 0;font-weight:bold;border-bottom:2px solid #eee;color:#2d6a4f">🌟 Vision</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Dans 3 mois</td><td style="padding:4px 8px">${short_goal || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">3 grands rêves</td><td style="padding:4px 8px">${dream || '—'}</td></tr>
          <tr><td style="padding:4px 8px;color:#555">Pourquoi moi ?</td><td style="padding:4px 8px">${why_me || '—'}</td></tr>

        </table>
      </div>
    `

    // ── 3. EMAIL → CLIENT (mail de bienvenue motivant) ────────────────────────
    const firstName = identity.split(' ')[0]

    const clientHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0d1117;color:#e8e8e8;border-radius:16px;padding:40px">

        <h1 style="font-size:28px;color:#7baf6e;margin-bottom:4px">Bienvenue, ${firstName}. 🔥</h1>
        <p style="color:#aaa;margin-top:0;font-size:14px">The Smart Way — Ta transformation commence maintenant.</p>

        <hr style="border:none;border-top:1px solid #222;margin:24px 0"/>

        <p style="font-size:16px;line-height:1.7">
          Tes informations ont bien été transmises. Tu fais maintenant partie d'une communauté d'élite — 
          des hommes et des femmes qui ont décidé de reprendre le contrôle sur leur corps, leur énergie et leur vie.
        </p>

        <p style="font-size:16px;line-height:1.7">
          Ce n'est pas un coaching basique. C'est une méthode construite pour toi, autour de toi, 
          avec un seul objectif : faire de toi la meilleure version de toi-même — physiquement, mentalement, durablement.
        </p>

        <p style="font-size:16px;line-height:1.7">
          Tu as pris la décision que la plupart n'osent jamais prendre. Cette décision, elle change tout.
        </p>

        <div style="background:#111;border-left:4px solid #7baf6e;padding:16px 20px;border-radius:8px;margin:24px 0">
          <p style="margin:0;font-size:15px;color:#ccc;line-height:1.6">
            <strong style="color:#7baf6e">La prochaine étape :</strong><br/>
            Je vais analyser tes réponses et te contacter personnellement pour construire ensemble 
            ton programme sur-mesure. Garde ton téléphone près de toi. 💬
          </p>
        </div>

        <p style="font-size:14px;color:#777;margin-top:32px">
          — The Smart Way Coaching<br/>
          <a href="mailto:thesmartway.coaching@gmail.com" style="color:#7baf6e">thesmartway.coaching@gmail.com</a>
        </p>

      </div>
    `

    // ── 4. ENVOI DES DEUX MAILS ───────────────────────────────────────────────
    try {
      await Promise.all([
        resend.emails.send({
          from: 'The Smart Way <coaching@thesmartway.fr>',
          to: COACH_EMAIL,
          subject: `🏋️ Nouvelle candidature : ${identity}`,
          html: coachHtml,
        }),
        resend.emails.send({
          from: 'The Smart Way <coaching@thesmartway.fr>',
          to: email,
          subject: `${firstName}, ta transformation commence maintenant 🔥`,
          html: clientHtml,
        }),
      ])
    } catch (err) {
      // On log l'erreur mail mais on ne bloque pas le succès
      // (les données sont déjà en base)
      console.error('EMAIL ERROR:', err)
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('GLOBAL API ERROR:', err)
    return NextResponse.json({ error: 'Erreur serveur globale' }, { status: 500 })
  }
}