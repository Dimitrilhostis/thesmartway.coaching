import Link from 'next/link'

export default async function MassagePage() {
  const services = [
    {
      title: 'Massage récupération après séance',
      subtitle: 'Après le sport, pour relâcher vite et récupérer mieux',
      price: 'À partir de 50€',
      duration: '45 min',
      description:
        'Un massage pensé pour les personnes actives qui veulent délester leur corps après l’effort. Idéal après une séance intense, une sortie course, un entraînement musculaire ou une période physique chargée.',
      points: [
        'Aide à réduire la sensation de jambes lourdes et de raideur',
        'Favorise un relâchement musculaire rapide après l’effort',
        'Permet de repartir plus léger, plus mobile, plus frais',
      ],
    },
    {
      title: 'Massage deep tissue à domicile',
      subtitle: 'Un travail plus profond sur les tensions installées',
      price: 'À partir de 70€',
      duration: '60 min',
      description:
        'Un massage plus appuyé, ciblé sur les zones chargées, les tensions profondes et les sensations de nœuds. Le tout directement à domicile, pour profiter du relâchement sans contrainte de déplacement.',
      points: [
        'Travail ciblé sur les tensions profondes et les zones dures',
        'Très utile si le stress, la posture ou l’entraînement chargent ton corps',
        'Confort maximal grâce au déplacement à domicile',
      ],
    },
  ]

  const benefits = [
    {
      title: 'Récupérer plus vite',
      text:
        'Quand ton corps relâche mieux, tu encaisses mieux. Tu réduis la sensation d’accumulation et tu retrouves plus facilement de bonnes sensations physiques.',
    },
    {
      title: 'Libérer les tensions',
      text:
        'Dos, trapèzes, nuque, hanches, jambes : certaines zones gardent la charge pendant des jours. Le massage aide à casser cette impression de blocage.',
    },
    {
      title: 'Mieux bouger',
      text:
        'Un corps moins contracté est souvent plus fluide, plus mobile et plus agréable à habiter. Tu le ressens dans le sport, dans la posture et dans la journée.',
    },
    {
      title: 'Faire redescendre la pression',
      text:
        'Le relâchement n’est pas seulement musculaire. Il joue aussi sur la respiration, le calme intérieur et la sensation globale de mieux-être.',
    },
  ]

  const practical = [
    {
      title: 'Réservation simple',
      text:
        'Tu identifies rapidement la prestation qui te correspond, puis tu prends contact sans perdre de temps.',
    },
    {
      title: 'À domicile pour le deep tissue',
      text:
        'Pas besoin de bouger. Tu restes chez toi, dans de bonnes conditions, et tu prolonges naturellement les effets après la séance.',
    },
    {
      title: 'Adapté à ton besoin',
      text:
        'Récupération sportive, tensions installées, fatigue physique, besoin de souffler : la séance s’adapte à ton état du moment.',
    },
  ]

  const feelings = [
    'Se relever en se sentant plus léger',
    'Respirer plus librement',
    'Sentir son corps moins fermé, moins dur, moins chargé',
    'Avoir enfin l’impression de couper vraiment',
    'Retrouver une vraie sensation de confort physique',
  ]

  return (
    <div className="min-h-screen bg-forest text-cream">
      {/* HERO */}
      <section className="px-4 md:px-6 pt-8 md:pt-12 pb-6 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[32px] border border-border-light bg-[linear-gradient(135deg,rgba(28,43,28,0.96)_0%,rgba(46,66,48,0.92)_55%,rgba(92,125,82,0.88)_100%)] p-6 md:p-8 shadow-glass">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(123,175,110,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(237,240,232,0.06),transparent_28%)]" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.24em] text-mist mb-3">
                Massages • récupération • bien-être
              </p>

              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-8 items-end">
                <div>
                  <h1 className="font-display text-5xl md:text-7xl tracking-wide leading-[0.92] text-cream">
                    DES MASSAGES
                    <br />
                    QUI FONT
                    <br />
                    VRAIMENT DU BIEN
                  </h1>

                  <p className="max-w-2xl text-sm md:text-base text-mist leading-relaxed mt-5 md:mt-6">
                    Ici, le message doit être immédiat : <span className="text-cream">on propose des massages</span>.
                    Des prestations claires, utiles, pensées pour relâcher le corps,
                    accélérer la récupération et retrouver de meilleures sensations au quotidien.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-7">
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

                <div className="grid gap-3">
                  <div className="rounded-[24px] border border-border-light bg-card-dark/90 p-4 backdrop-blur-lg shadow-glass-sm">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-mist mb-2">
                      Prestation 01
                    </p>
                    <p className="text-lg font-medium text-cream">
                      Massage récupération après séance
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Pour relâcher vite, récupérer mieux, repartir plus léger.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-border-light bg-card-dark/90 p-4 backdrop-blur-lg shadow-glass-sm">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-mist mb-2">
                      Prestation 02
                    </p>
                    <p className="text-lg font-medium text-cream">
                      Deep tissue à domicile
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Pour les tensions profondes, directement chez toi.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-border-light bg-accent/12 p-4 backdrop-blur-lg">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-mist mb-2">
                      Objectif
                    </p>
                    <p className="text-lg font-medium text-cream">
                      Moins de tension. Plus de confort. Plus de relâchement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-5 md:mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-dim mb-2">
              Prestations disponibles
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-wide text-cream leading-[0.95]">
              CHOISIS LE MASSAGE
              <br />
              DONT TON CORPS A
              <br />
              BESOIN
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`relative overflow-hidden rounded-[28px] border p-5 md:p-6 shadow-glass ${
                  index === 0
                    ? 'border-border-light bg-[linear-gradient(180deg,rgba(20,38,20,0.82)_0%,rgba(13,22,13,0.92)_100%)]'
                    : 'border-border bg-card-dark'
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(123,175,110,0.10),transparent_30%)]" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                    <div className="max-w-xl">
                      <p className="text-xs uppercase tracking-[0.22em] text-mist mb-2">
                        {service.duration}
                      </p>
                      <h3 className="text-2xl md:text-3xl font-display tracking-wide text-cream leading-tight">
                        {service.title}
                      </h3>
                      <p className="text-sm text-accent mt-2">{service.subtitle}</p>
                    </div>

                    <div className="shrink-0 rounded-[20px] border border-border-light bg-accent/10 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-mist mb-1">
                        Tarif
                      </p>
                      <p className="font-display text-2xl text-cream">
                        {service.price}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-mist leading-relaxed mb-5">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {service.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-[20px] border border-border bg-white/[0.03] px-4 py-3"
                      >
                        <p className="text-sm text-mist leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-forest transition hover:scale-[1.02]"
                    >
                      Réserver
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex items-center rounded-full border border-border-light bg-card px-5 py-3 text-sm text-cream backdrop-blur-md transition hover:bg-card-dark"
                    >
                      Poser une question
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto rounded-[32px] border border-border bg-card p-6 md:p-7 backdrop-blur-lg shadow-glass">
          <div className="mb-5 md:mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-dim mb-2">
              Ce que ça t’apporte
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-wide text-cream leading-[0.95]">
              DES BÉNÉFICES
              <br />
              RAPIDES, CONCRETS,
              <br />
              RESSENTIS
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-border bg-card-dark p-5"
              >
                <p className="text-lg text-cream font-medium mb-3">{item.title}</p>
                <p className="text-sm text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRACTICAL + FEELINGS */}
      <section className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
          <div className="rounded-[30px] border border-border-light bg-[linear-gradient(180deg,rgba(46,66,48,0.88)_0%,rgba(28,43,28,0.96)_100%)] p-6 md:p-7 shadow-glass">
            <p className="text-xs uppercase tracking-[0.24em] text-mist mb-2">
              Clair, pratique, intelligent
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-wide text-cream mb-4 leading-[0.95]">
              N’ATTENDS PAS
              <br />
              D’ÊTRE
              <br />
              COMPLÈTEMENT BLOQUÉ
            </h2>

            <p className="text-sm text-mist leading-relaxed mb-4">
              Beaucoup attendent trop. Ils laissent les tensions s’installer, la fatigue
              s’accumuler, le corps se fermer petit à petit.
            </p>

            <p className="text-sm text-mist leading-relaxed">
              Réserver un massage, ce n’est pas “se faire plaisir pour rien”.
              C’est souvent une façon simple et pertinente de reprendre de l’avance sur
              la fatigue, la raideur et la charge mentale.
            </p>

            <div className="mt-6 space-y-3">
              {practical.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-border-light bg-black/10 px-4 py-4"
                >
                  <p className="text-base text-cream font-medium mb-2">{item.title}</p>
                  <p className="text-sm text-mist leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-card-dark p-6 md:p-7 shadow-glass">
            <p className="text-xs uppercase tracking-[0.24em] text-dim mb-2">
              Le ressenti recherché
            </p>
            <h2 className="font-display text-3xl md:text-5xl tracking-wide text-cream mb-4 leading-[0.95]">
              TU CHERCHES
              <br />
              À TE SENTIR
              <br />
              MIEUX, VRAIMENT
            </h2>

            <p className="text-sm text-muted leading-relaxed mb-5">
              Au fond, tu ne cherches pas juste une technique. Tu cherches un corps qui
              redescend, une respiration plus libre, une sensation de confort retrouvée.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {feelings.map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-border bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm text-mist leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 md:px-6 py-8 md:py-10">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[36px] border border-border-light bg-[linear-gradient(135deg,rgba(92,125,82,0.18)_0%,rgba(28,43,28,0.95)_35%,rgba(13,22,13,1)_100%)] p-6 md:p-8 shadow-glass">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,175,110,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(237,240,232,0.04),transparent_25%)]" />
            <div className="relative z-10">
              <p className="text-xs uppercase tracking-[0.24em] text-mist mb-2">
                Réserver maintenant
              </p>

              <h2 className="font-display text-4xl md:text-6xl tracking-wide text-cream mb-4 leading-[0.92]">
                TON CORPS T’ENVOIE
                <br />
                DÉJÀ DES SIGNAUX
              </h2>

              <p className="max-w-2xl text-sm md:text-base text-mist leading-relaxed mb-6">
                Massage récupération après séance ou deep tissue à domicile :
                dans les deux cas, l’objectif est simple. T’aider à récupérer,
                relâcher les tensions et retrouver de meilleures sensations maintenant.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-forest transition hover:scale-[1.02]"
                >
                  Réserver une séance
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-border-light bg-card px-5 py-3 text-sm text-cream backdrop-blur-md transition hover:bg-card-dark"
                >
                  Me contacter
                </Link>
              </div>

              <p className="text-xs text-dim mt-5 leading-relaxed max-w-3xl">
                Ces prestations s’inscrivent dans une démarche de bien-être, récupération
                et détente. Elles ne remplacent pas un avis ou un suivi médical si nécessaire.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}