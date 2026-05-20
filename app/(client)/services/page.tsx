import Link from 'next/link'

const services = [
  {
    id: '01',
    title: 'Massage récupération',
    subtitle: 'Après le sport, pour relâcher vite et récupérer mieux',
    price: 'À partir de 50€',
    duration: '45 min',
    description:
      'Pensé pour les personnes actives après une séance intense, une sortie course ou une période physique chargée.',
    points: [
      'Réduit la sensation de jambes lourdes et de raideur',
      "Relâchement musculaire rapide après l'effort",
      'Tu repars plus léger, plus mobile, plus frais',
    ],
  },
  {
    id: '02',
    title: 'Deep tissue à domicile',
    subtitle: 'Un travail profond sur les tensions installées',
    price: 'À partir de 70€',
    duration: '60 min',
    description:
      'Un massage plus appuyé sur les zones chargées et les tensions profondes, directement chez toi.',
    points: [
      'Travail ciblé sur les nœuds et tensions profondes',
      'Utile si stress, posture ou entraînement chargent ton corps',
      'Confort maximal grâce au déplacement à domicile',
    ],
  },
]

export default function MassagePage() {
  return (
    <div className="min-h-screen text-cream">

      {/* Hero */}
      <section className="relative px-4 md:px-8 pt-12 pb-8 max-w-5xl mx-auto overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(74,222,128,0.09) 0%, transparent 65%)' }}
        />
        <div className="relative">
          <p className="section-label mb-4">Massages • Récupération • Bien-être</p>
          <h1 className="font-display text-7xl md:text-9xl leading-none tracking-wide mb-6">
            DES MASSAGES
            <br />
            QUI FONT
            <br />
            DU <span className="text-accent text-glow">BIEN</span>
          </h1>
          <p className="text-muted text-base max-w-lg leading-relaxed mb-8">
            Deux prestations claires pour relâcher le corps, accélérer la récupération
            et retrouver de meilleures sensations au quotidien.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary px-7 py-3 text-sm">
              Réserver un massage
            </Link>
            <Link href="#services" className="btn-ghost px-7 py-3 text-sm">
              Voir les prestations
            </Link>
          </div>
        </div>
      </section>

      {/* Stats rapides */}
      <section className="border-y border-border py-8 mb-4">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex gap-10 md:gap-16 flex-wrap">
          {[
            { label: 'À domicile', value: 'Deep tissue' },
            { label: 'Post-effort', value: 'Récupération' },
            { label: 'Durée', value: '45–60 min' },
            { label: 'Déplacement', value: 'Inclus' },
          ].map((s) => (
            <div key={s.label}>
              <p className="section-label mb-1">{s.label}</p>
              <p className="text-sm font-medium text-cream">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-4 md:px-8 py-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="section-label mb-3">Prestations</p>
          <h2 className="page-title">CHOISIS CE DONT TU AS BESOIN</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <div
              key={service.id}
              className="card rounded-2xl p-6 border border-border hover:border-accent/35 transition-all duration-200 hover:shadow-glass"
              style={i === 0 ? { borderTopColor: 'rgba(74,222,128,0.5)', borderTopWidth: 2 } : {}}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="section-label">{service.id}</span>
                    <span className="section-label opacity-60">{service.duration}</span>
                  </div>
                  <h3 className="font-display text-4xl tracking-wide text-cream leading-none">
                    {service.title.toUpperCase()}
                  </h3>
                  <p className="text-xs text-accent mt-1.5">{service.subtitle}</p>
                </div>
                <div className="shrink-0 card rounded-2xl px-4 py-3 text-right border border-border">
                  <p className="section-label mb-1">Tarif</p>
                  <p className="font-display text-xl text-cream">{service.price}</p>
                </div>
              </div>

              <p className="text-sm text-muted leading-relaxed mb-5">{service.description}</p>

              <div className="flex flex-col gap-2 mb-6">
                {service.points.map((point) => (
                  <div key={point} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-white/2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <p className="text-sm text-muted leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Link href="/contact" className="btn-primary px-5 py-2.5 text-sm rounded-xl">
                  Réserver
                </Link>
                <Link href="/contact" className="btn-ghost px-5 py-2.5 text-sm rounded-xl">
                  Une question ?
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bénéfices */}
      <section className="px-4 md:px-8 pb-10 max-w-5xl mx-auto">
        <div className="card rounded-2xl p-6 border border-border">
          <p className="section-label mb-6">Ce que ça t'apporte</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { title: 'Récupérer plus vite', text: "Moins d'accumulation, meilleures sensations physiques." },
              { title: 'Libérer les tensions', text: 'Dos, nuque, hanches, jambes : casser le blocage.' },
              { title: 'Mieux bouger', text: 'Corps moins contracté, plus fluide dans le sport et la posture.' },
              { title: 'Faire redescendre', text: 'Relâchement musculaire et mental, calme intérieur.' },
            ].map((b) => (
              <div key={b.title} className="card rounded-xl p-4 border border-border">
                <p className="text-sm font-medium text-cream mb-1.5">{b.title}</p>
                <p className="text-xs text-muted leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 md:px-8 pb-16 max-w-5xl mx-auto">
        <div
          className="card rounded-2xl p-8 md:p-10 border border-border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
          style={{ borderTopColor: 'rgba(74,222,128,0.5)', borderTopWidth: 2 }}
        >
          <div>
            <p className="section-label mb-3">Ton corps t'envoie déjà des signaux</p>
            <h2 className="font-display text-5xl md:text-7xl tracking-wide text-cream leading-none mb-4">
              N'ATTENDS PAS
              <br />
              D'ÊTRE BLOQUÉ
            </h2>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              Récupération ou deep tissue : l'objectif est simple.
              Relâcher, récupérer, retrouver de meilleures sensations.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:shrink-0">
            <Link href="/contact" className="btn-primary px-8 py-3.5 text-sm rounded-xl text-center">
              Réserver une séance
            </Link>
            <Link href="/contact" className="btn-ghost px-8 py-3.5 text-sm rounded-xl text-center">
              Me contacter
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
