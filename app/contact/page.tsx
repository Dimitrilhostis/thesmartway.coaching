import ContactForm from '@/components/client/ContactForm'
import { Mail, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="h-screen overflow-hidden flex items-center justify-center text-cream px-6">
      
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-6">

        {/* LEFT - INFOS */}
        <div className="rounded-[28px] border border-border bg-forest-light/40 p-6 md:p-7 flex flex-col justify-between">

          <div>
            <p className="section-label mb-2">Contact</p>

            <h1 className="font-display text-5xl md:text-6xl leading-[0.95] tracking-wide mb-4">
              CONTACTE-
              <br />
              <span className="text-accent">MOI</span>
            </h1>

            <p className="text-sm text-muted leading-relaxed mb-6">
              Coaching, nutrition, massages ou simple question.
              Le plus simple, c’est de m’écrire.
            </p>

            <div className="space-y-4">
              <a
                href="tel:0768704364"
                className="group flex items-start gap-4 rounded-[18px] border border-border bg-forest-light/50 p-4 transition hover:border-accent"
              >
                <div className="w-10 h-10 rounded-xl border border-border bg-forest-light flex items-center justify-center shrink-0 group-hover:border-accent transition">
                  <Phone className="w-4 h-4 text-accent" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-dim mb-1">
                    Téléphone
                  </p>
                  <p className="text-base text-cream font-medium">
                    07 68 70 43 64
                  </p>
                </div>
              </a>

              <a
                href="mailto:thesmartway.coaching@gmail.com"
                className="group flex items-start gap-4 rounded-[18px] border border-border bg-forest-light/50 p-4 transition hover:border-accent"
              >
                <div className="w-10 h-10 rounded-xl border border-border bg-forest-light flex items-center justify-center shrink-0 group-hover:border-accent transition">
                  <Mail className="w-4 h-4 text-accent" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-dim mb-1">
                    Email
                  </p>
                  <p className="text-base text-cream font-medium break-all">
                    thesmartway.coaching@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* petit retour */}
          <a
            href="/"
            className="text-xs text-dim hover:text-accent transition mt-6"
          >
            ← Retour au site
          </a>
        </div>

        {/* RIGHT - FORM */}
        <div className="rounded-[28px] border border-border bg-forest-light/40 p-6 md:p-7 flex flex-col justify-between">

          <div>
            <p className="section-label mb-2">Formulaire</p>
            <h2 className="page-title mb-6">ENVOYER UNE DEMANDE</h2>

            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  )
}