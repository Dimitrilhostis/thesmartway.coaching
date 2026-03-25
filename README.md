# The Smart Way — Setup

## Démarrage rapide

```bash
# 1. Cloner / copier les fichiers dans ton projet
# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.local.example .env.local
# → Remplir toutes les valeurs (voir ci-dessous)

# 4. Lancer en dev
npm run dev
```

## Variables d'environnement

### Supabase
- Dashboard → Settings → API
- Copier `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copier `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copier `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (ne jamais exposer)

### Stripe
- dashboard.stripe.com → Developers → API keys
- Copier Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Copier Secret key → `STRIPE_SECRET_KEY`
- Pour le webhook local : `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Copier le webhook secret → `STRIPE_WEBHOOK_SECRET`

## Créer le premier compte admin

1. Supabase Dashboard → Authentication → Users → Invite user
2. Entrer ton email de coach et valider l'invitation
3. Dans SQL Editor, exécuter :
```sql
update public.users set role = 'admin' where email = 'ton@email.com';
```

## Structure des routes

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Page vitrine |
| `/boutique` | Public | Boutique (achat nécessite connexion) |
| `/login` | Public | Connexion |
| `/espace` | Client | Planning, programme, messages, rappels |
| `/compte` | Client | Profil, notifications, sécurité |
| `/dashboard` | Admin | Vue d'ensemble, stats |
| `/clients` | Admin | Gestion clients, programmes, notes |
| `/admin/boutique` | Admin | Gestion produits |

## Déploiement Vercel

1. Push sur GitHub
2. Importer le repo dans Vercel
3. Ajouter toutes les variables d'environnement dans Project Settings → Environment Variables
4. Déployer

Pour les webhooks Stripe en production :
- Stripe Dashboard → Webhooks → Add endpoint
- URL : `https://ton-domaine.com/api/stripe/webhook`
- Events : `checkout.session.completed`, `checkout.session.expired`

## WhatsApp (étape suivante)

Deux options :
- **Twilio** : plus simple, rapide à tester — twilio.com/whatsapp
- **Meta Cloud API** : gratuit mais setup plus long — developers.facebook.com/docs/whatsapp

Le webhook est préparé dans `app/api/whatsapp/webhook/route.ts`.
