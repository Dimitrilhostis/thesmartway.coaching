import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, type Product } from '@/lib/types'
import FooterReveal from '@/components/client/FooterReveal'
import ClientNav from '@/components/client/ClientNav'
import {
  CalendarDays,
  Clock,
  MessageCircleMore,
  Salad,
  Hand,
  Book
} from 'lucide-react'

interface RoadmapMeta { slug: string; title: string; emoji: string; color: string }

function getPreviewRoadmaps(): RoadmapMeta[] {
  try {
    const dir = path.join(process.cwd(), 'data/roadmaps')
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).slice(0, 4)
    return files.map((f) => {
      const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
      return { slug: r.slug, title: r.title, emoji: r.emoji, color: r.color }
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const previewRoadmaps = getPreviewRoadmaps()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3)

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data
  }

  const services = [
    {
      icon: CalendarDays,
      title: 'Planning personnalisé',
      desc: 'Emploi du temps adapté, mis à jour chaque semaine.',
      href: '/espace',
    },
    {
      icon: MessageCircleMore,
      title: 'Échange direct',
      desc: 'Messagerie avec ton coach. Suivi constant.',
      href: '/contact',
    },
    {
      icon: Salad,
      title: 'Nutrition sur mesure',
      desc: 'Plans alimentaires, macros calculés pour toi.',
      href: '/espace',
    },
    {
      icon: Clock,
      title: 'Timer',
      desc: 'Un excellent outil pour tes ses sessions.',
      href: '/outils/timer',
    },
    {
      icon: Hand,
      title: 'Massages',
      desc: 'Récupération après séance et deep tissue pour relâcher les tensions.',
      href: '/services',
    },
    {
      icon: Book,
      title: 'E-book',
      desc: 'Des ressources pour développer tes connaissances et reprendre le contrôle.',
      href: '/boutique',
    },
  ]

  return (
    <div className="min-h-screen text-cream">
      {/* Nav */}
      <ClientNav user={profile} />

      {/* Hero */}
      <section className="relative max-w-4xl mx-auto px-6 pt-28 pb-20 text-center overflow-hidden">
        {/* Focused spotlight glow */}
        <div
          className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 55% at 50% 10%, rgba(74,222,128,0.11) 0%, transparent 65%)" }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-2 border border-accent/20 bg-accent/8 text-accent text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-8">
            Coaching • Nutrition • Massages
          </div>

          <h1 className="font-display text-7xl md:text-9xl leading-none tracking-wide mb-6">
            TRANSFORME
            <br />
            TON <span className="text-accent text-glow">CORPS,</span>
            <br />
            TRANSFORME
            <br />
            TA VIE.
          </h1>

          <p className="text-muted text-base max-w-lg mx-auto mb-10 leading-relaxed">
            Un accompagnement sur mesure, des programmes éprouvés, des outils utiles
            et des prestations pensées pour t’aider à mieux bouger, mieux récupérer
            et mieux vivre dans ton corps.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/boutique" className="btn-primary py-3 px-7 text-sm">
              Découvrir les programmes
            </Link>
            <Link
              href="/services"
              className="btn-ghost px-7 py-3 text-sm"
            >
              Voir les services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border py-10">
        <div className="max-w-3xl mx-auto flex justify-center gap-12 md:gap-20 flex-wrap px-6">
          {[
            { value: '+340', label: 'Clients transformés' },
            { value: '5 ans', label: "D'expérience" },
            { value: '92%', label: 'Objectifs atteints' },
            { value: '4.9★', label: 'Note moyenne' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-5xl text-accent text-glow">{s.value}</p>
              <p className="section-label mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-10">
          <p className="section-label mb-3">Ce qu'on fait ensemble</p>
          <h2 className="page-title">TOUT POUR RÉUSSIR</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.title} href={item.href} className="group">
                <div className="card p-5 border border-border rounded-2xl transition-all duration-200 hover:border-accent/40 hover:bg-white/5 cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    <div className="w-9 h-9 bg-white/5 border border-border rounded-xl flex items-center justify-center mb-4 group-hover:border-accent/40 group-hover:bg-accent/8 transition-all duration-200">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="text-sm font-medium text-cream mb-1.5">{item.title}</h3>
                    <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-dim">Accéder</span>
                    <span className="text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Roadmaps */}
      {profile && previewRoadmaps.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <p className="section-label mb-3">Progression</p>
          <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <h2 className="page-title">MES ROADMAPS</h2>
            <Link href="/roadmaps" className="text-xs text-accent hover:text-cream transition-colors tracking-wide">
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {previewRoadmaps.map((rm) => (
              <Link key={rm.slug} href={`/roadmaps/${rm.slug}`} className="block group">
                <div
                  className="card p-4 rounded-2xl border border-border transition-all duration-200 group-hover:border-accent/35 group-hover:-translate-y-0.5 group-hover:shadow-glass h-full"
                  style={{ borderTopColor: rm.color, borderTopWidth: 2 }}
                >
                  <div className="text-2xl mb-3">{rm.emoji}</div>
                  <p className="text-xs font-medium text-cream mb-1 truncate">{rm.title}</p>
                  <p className="text-xs text-dim group-hover:text-accent transition-colors">Voir →</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produits mis en avant */}
      {products && products.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <p className="section-label mb-3">Boutique</p>
          <div className="flex items-end justify-between mb-8">
            <h2 className="page-title">PROGRAMMES &amp; RESSOURCES</h2>
            <Link href="/boutique" className="text-xs text-accent hover:text-cream transition-colors tracking-wide">
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((p: Product) => (
              <div key={p.id} className="card overflow-hidden group border border-border rounded-2xl hover:border-accent/35 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass">
                <div className="h-32 m-2 bg-white/4 rounded-xl flex items-center justify-center relative">
                  <span className="text-5xl">
                    {p.category === 'programme' ? '💪' : p.category === 'ebook' ? '📖' : '🗺️'}
                  </span>
                  {p.badge && (
                    <span className="absolute top-2.5 right-2.5 text-xs px-2.5 py-0.5 rounded-full glass-pill text-accent">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 pt-2">
                  <p className="section-label mb-1">{p.category}</p>
                  <p className="text-sm font-medium text-cream mb-3 leading-snug">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-accent">{formatPrice(p.price_cents)}</span>
                    <Link href="/boutique" className="text-xs text-dim group-hover:text-accent transition-colors">Voir →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Témoignages */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="section-label mb-3">Résultats</p>
        <h2 className="page-title mb-8">ILS ONT CHANGÉ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Lucas M.', result: '−14 kg en 4 mois', quote: '"Le suivi perso change tout."' },
            { name: 'Sara K.', result: 'Prise de masse +6 kg', quote: '"Résultats visibles en 3 semaines."' },
            { name: 'Théo B.', result: 'Marathon en 3h42', quote: `"La structure hebdo m'a tout appris."` },
            { name: 'Inès R.', result: 'Rééquilibrage complet', quote: '"Bien au-delà du physique."' },
          ].map((t) => (
            <div key={t.name} className="card p-5 rounded-2xl border border-border" style={{ borderTopColor: 'rgba(74,222,128,0.5)', borderTopWidth: 2 }}>
              <p className="text-sm font-semibold text-cream">{t.name}</p>
              <p className="text-xs text-accent mt-0.5 mb-3 font-medium">{t.result}</p>
              <p className="text-xs text-muted leading-relaxed italic">{t.quote}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <FooterReveal />
    </div>
  )
}