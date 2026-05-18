import Link from 'next/link'

export default function MassagePage() {
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

  return (
    <div className="min-h-screen bg-forest text-cream">

      {/* HERO — compact */}
      <section className="px-4 md:px-6 pt-8 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-border-light bg-[linear-gradient(135deg,rgba(28,43,28,0.97)_0%,rgba(46,66,48,0.92)_60%,rgba(92,125,82,0.85)_100%)] px-6 py-8 md:px-10 md:py-10 shadow-glass">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(123,175,110,0.15),transparent_35%)]" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end gap-8">
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-[0.26em] text-mist mb-4">
                  Massages • Récupération • Bien-être
                </p>
                <h1 className="font-display text-6xl md:text-8xl tracking-wide leading-[0.88] text-cream mb-5">
                  DES MASSAGES
                  <br />
                  QUI FONT
                  <br />
                  DU BIEN
                </h1>
                <p className="text-sm text-mist leading-relaxed max-w-lg mb-6">
                  Deux prestations claires pour relâcher le corps, accélérer la récupération
                  et retrouver de meilleures sensations au quotidien.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-forest transition hover:scale-[1.02]"
                  >
                    Réserver un massage
                  </Link>
                  <Link
                    href="#services"
                    className="inline-flex items-center rounded-full border border-border-light bg-card px-5 py-3 text-sm text-cream backdrop-blur-md transition hover:bg-card-dark"
                  >
                    Voir les prestations
                  </Link>
                </div>
              </div>

              {/* Stats rapides */}
              <div className="flex lg:flex-col gap-3 lg:shrink-0">
                <div className="rounded-[20px] border border-border-light bg-card-dark/90 px-4 py-3 backdrop-blur-lg">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-dim mb-1">À domicile</p>
                  <p className="text-base font-medium text-cream">Deep tissue</p>
                </div>
                <div className="rounded-[20px] border border-border bg-card-dark/90 px-4 py-3 backdrop-blur-lg">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-dim mb-1">Post-effort</p>
                  <p className="text-base font-medium text-cream">Récupération</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-4 md:px-6 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="mb-5">
            <p className="text-[11px] uppercase tracking-[0.24em] text-dim mb-2">Prestations</p>
            <h2 className="font-display text-4xl md:text-6xl tracking-wide text-cream leading-[0.9]">
              CHOISIS CE
              <br />
              DONT TU AS BESOIN
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <div
                key={service.id}
                className={`relative overflow-hidden rounded-[28px] border p-5 md:p-6 shadow-glass ${
                  i === 0
                    ? 'border-border-light bg-[linear-gradient(180deg,rgba(20,38,20,0.85)_0%,rgba(13,22,13,0.95)_100%)]'
                    : 'border-border bg-card-dark'
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(123,175,110,0.09),transparent_35%)]" />
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] uppercase tracking-[0.22em] text-dim">{service.id}</span>
                        <span className="text-[10px] uppercase tracking-[0.22em] text-mist">{service.duration}</span>
                      </div>
                      <h3 className="font-display text-3xl md:text-4xl tracking-wide text-cream leading-tight">
                        {service.title.toUpperCase()}
                      </h3>
                      <p className="text-xs text-accent mt-1">{service.subtitle}</p>
                    </div>
                    <div className="shrink-0 rounded-[16px] border border-border-light bg-accent/10 px-3 py-2 text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-mist mb-1">Tarif</p>
                      <p className="font-display text-xl text-cream">{service.price}</p>
                    </div>
                  </div>

                  <p className="text-sm text-mist leading-relaxed mb-4">{service.description}</p>

                  <div className="space-y-2 mb-5">
                    {service.points.map((point) => (
                      <div key={point} className="flex items-start gap-2 rounded-[16px] border border-border bg-white/[0.025] px-3 py-2.5">
                        <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        <p className="text-sm text-mist leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-forest transition hover:scale-[1.02]"
                    >
                      Réserver
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center rounded-full border border-border-light bg-card px-4 py-2.5 text-sm text-cream transition hover:bg-card-dark"
                    >
                      Une question ?
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BÉNÉFICES — bande horizontale compacte */}
      <section className="px-4 md:px-6 py-5">
        <div className="max-w-5xl mx-auto rounded-[28px] border border-border bg-card p-5 md:p-6 backdrop-blur-lg shadow-glass">
          <p className="text-[11px] uppercase tracking-[0.24em] text-dim mb-4">Ce que ça t'apporte</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {[
              { title: 'Récupérer plus vite', text: "Moins d'accumulation, meilleures sensations physiques." },
              { title: 'Libérer les tensions', text: "Dos, nuque, hanches, jambes : casser l'impression de blocage." },
              { title: 'Mieux bouger', text: 'Corps moins contracté, plus fluide dans le sport et la posture.' },
              { title: 'Faire redescendre', text: 'Relâchement musculaire et mental, respiration, calme intérieur.' },
            ].map((b) => (
              <div key={b.title} className="rounded-[20px] border border-border bg-card-dark p-4">
                <p className="text-sm font-medium text-cream mb-1.5">{b.title}</p>
                <p className="text-xs text-muted leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-border-light bg-[linear-gradient(135deg,rgba(92,125,82,0.16)_0%,rgba(28,43,28,0.96)_40%,rgba(13,22,13,1)_100%)] px-6 py-7 md:px-10 md:py-8 shadow-glass">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,175,110,0.14),transparent_30%)]" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.26em] text-mist mb-2">Ton corps t'envoie déjà des signaux</p>
                <h2 className="font-display text-4xl md:text-6xl tracking-wide text-cream leading-[0.9]">
                  N'ATTENDS PAS
                  <br />
                  D'ÊTRE BLOQUÉ
                </h2>
                <p className="text-sm text-mist leading-relaxed mt-3 max-w-md">
                  Récupération ou deep tissue : l'objectif est simple.
                  Relâcher, récupérer, retrouver de meilleures sensations.
                </p>
              </div>
              <div className="flex flex-col gap-2 lg:shrink-0">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-forest transition hover:scale-[1.02]"
                >
                  Réserver une séance
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-border-light bg-card px-6 py-3 text-sm text-cream transition hover:bg-card-dark"
                >
                  Me contacter
                </Link>
              </div>
            </div>
            <p className="relative z-10 text-[11px] text-dim mt-5 max-w-2xl leading-relaxed">
              Ces prestations s'inscrivent dans une démarche de bien-être et récupération.
              Elles ne remplacent pas un suivi médical si nécessaire.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}