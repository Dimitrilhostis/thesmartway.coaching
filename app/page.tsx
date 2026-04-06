import Link from 'next/link'
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

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-block border border-border text-accent text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
          Coaching • Nutrition • Massages
        </div>

        <h1 className="font-display text-7xl md:text-8xl leading-none tracking-wide mb-4">
          TRANSFORME
          <br />
          TON <span className="text-accent">CORPS,</span>
          <br />
          TRANSFORME
          <br />
          TA VIE.
        </h1>

        <p className="text-muted text-base max-w-xl mx-auto mb-8 leading-relaxed">
          Un accompagnement sur mesure, des programmes éprouvés, des outils utiles
          et des prestations pensées pour t’aider à mieux bouger, mieux récupérer
          et mieux vivre dans ton corps.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/boutique" className="btn-primary py-2 px-4">
            Découvrir les programmes
          </Link>
          <Link
            href="/services"
            className="glass-pill px-4 py-2 text-sm text-cream hover:text-accent transition"
          >
            Voir les services
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border py-8">
        <div className="max-w-3xl mx-auto flex justify-center gap-16 flex-wrap px-6">
          {[
            { value: '+340', label: 'Clients transformés' },
            { value: '5 ans', label: "D'expérience" },
            { value: '92%', label: 'Objectifs atteints' },
            { value: '4.9★', label: 'Note moyenne' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl text-accent">{s.value}</p>
              <p className="text-xs text-muted uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="page-title">TOUT POUR RÉUSSIR</h2>
          </div>  
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((item) => {
          const Icon = item.icon

          return (
            <Link key={item.title} href={item.href} className="group">
              <div className="card p-5 bg-forest-light/50 border border-border rounded-lg transition-all duration-200 hover:border-accent hover:bg-forest-light/70 hover:scale-[1.02] cursor-pointer h-full flex flex-col justify-between">
                
                <div>
                  <div className="w-10 h-10 bg-forest-light border border-border rounded-xl flex items-center justify-center mb-4 group-hover:border-accent transition">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>

                  <h3 className="text-sm font-medium text-cream mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* footer interaction */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-dim">Accéder</span>
                  <span className="text-accent text-sm opacity-0 group-hover:opacity-100 transition">
                    →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      </section>

      {/* Produits mis en avant */}
      {products && products.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <p className="section-label mb-2">Boutique</p>
          <div className="flex items-end justify-between mb-6">
            <h2 className="page-title">PROGRAMMES &amp; RESSOURCES</h2>
            <Link href="/boutique" className="text-sm text-accent hover:underline">
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((p: Product) => (
              <div
                key={p.id}
                className="card overflow-hidden hover:border-sage transition-colors group bg-forest-light/50 border border-border rounded-lg"
              >
                <div className="h-28 m-1 bg-forest-mid/50 rounded flex items-center justify-center relative">
                  <span className="text-4xl">
                    {p.category === 'programme'
                      ? '💪'
                      : p.category === 'ebook'
                      ? '📖'
                      : '🗺️'}
                  </span>

                  {p.badge && (
                    <span className="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded-full bg-green-900/60 text-green-400 border border-green-800">
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-dim uppercase tracking-wider mb-1">
                    {p.category}
                  </p>
                  <p className="text-sm font-medium text-cream mb-3">{p.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl text-accent">
                      {formatPrice(p.price_cents)}
                    </span>
                    <Link href="/boutique" className="text-xs text-accent hover:underline">
                      Voir →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Témoignages */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <p className="section-label mb-2">Résultats</p>
        <h2 className="page-title mb-6">ILS ONT CHANGÉ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Lucas M.', result: '−14 kg en 4 mois', quote: '"Le suivi perso change tout."' },
            { name: 'Sara K.', result: 'Prise de masse +6 kg', quote: '"Résultats visibles en 3 semaines."' },
            { name: 'Théo B.', result: 'Marathon en 3h42', quote: `"La structure hebdo m'a tout appris."` },
            { name: 'Inès R.', result: 'Rééquilibrage complet', quote: '"Bien au-delà du physique."' },
          ].map((t) => (
            <div key={t.name} className="card p-4 border-t-2 border-t-sage">
              <p className="text-sm font-medium text-cream">{t.name}</p>
              <p className="text-xs text-accent mt-0.5 mb-2">{t.result}</p>
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