import ContactForm from '@/components/client/ContactForm'
import { Mail, Phone } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-cream px-4 py-8 md:px-6 md:py-0">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.9fr_1.1fr] gap-4">

        {/* LEFT */}
        <div className="card rounded-2xl border border-border p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="section-label mb-4">Contact</p>
            <h1 className="font-display text-6xl md:text-7xl leading-none tracking-wide mb-4">
              CONTACTE
              <span className="text-accent"> MOI</span>
            </h1>
            <p className="text-sm text-muted leading-relaxed mb-8">
              Coaching, nutrition, massages ou simple question.
              Le plus simple, c'est de m'écrire.
            </p>

            <div className="flex flex-col gap-3">
              <a href="tel:0768704364"
                className="group flex items-center gap-4 card rounded-2xl border border-border p-4 transition-all duration-200 hover:border-accent/40 hover:-translate-y-0.5">
                <div className="w-9 h-9 card rounded-xl border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 group-hover:bg-accent/8 transition">
                  <Phone className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="section-label mb-0.5">Téléphone</p>
                  <p className="text-sm text-cream font-medium">07 68 70 43 64</p>
                </div>
              </a>

              <a href="mailto:thesmartway.coaching@gmail.com"
                className="group flex items-center gap-4 card rounded-2xl border border-border p-4 transition-all duration-200 hover:border-accent/40 hover:-translate-y-0.5">
                <div className="w-9 h-9 card rounded-xl border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 group-hover:bg-accent/8 transition">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="section-label mb-0.5">Email</p>
                  <p className="text-sm text-cream font-medium break-all">thesmartway.coaching@gmail.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="card rounded-2xl border border-border p-6 md:p-8">
          <h2 className="page-title mb-6">ENVOYER UNE DEMANDE</h2>
          <ContactForm />
        </div>

      </div>
    </div>
  )
}
