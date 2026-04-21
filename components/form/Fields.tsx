export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
      {...props}
        className="
          w-full
          rounded-2xl
          bg-white/[0.03]
          border border-border
          text-cream
          placeholder:text-dim
          px-4 py-3
          text-m
          backdrop-blur-md
          shadow-glass-sm
          transition-all
          outline-none
  
          hover:bg-white/[0.05]
          hover:border-border-light
  
          focus:bg-white/[0.06]
          focus:border-accent/40
          focus:shadow-[0_0_0_1px_rgba(123,175,110,0.25)]
        "
      />
    )
  }
  

  export function TextArea(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <input
      {...props}
        className="
          w-full
          rounded-2xl
          bg-white/[0.03]
          border border-border
          text-cream
          placeholder:text-dim
          px-4 py-3
          text-m
          backdrop-blur-md
          shadow-glass-sm
          transition-all
          outline-none
  
          hover:bg-white/[0.05]
          hover:border-border-light
  
          focus:bg-white/[0.06]
          focus:border-accent/40
          focus:shadow-[0_0_0_1px_rgba(123,175,110,0.25)]
        "
      />
    )
  }

  export function Title({ children }: any) {
    return (
      <h2 className="text-3xl md:text-4xl font-display leading-tight">
        {children}
      </h2>
    )
  }
  
  export function Text({ children }: { children: React.ReactNode }) {
    return (
      <p className="
        text-base md:text-lg
        font-light
        leading-[1.8]
        text-cream/80
        max-w-xl mx-auto
        tracking-wide
      ">
        {children}
      </p>
    )
  }
  

  export function Option({children, ...props}: React.InputHTMLAttributes<HTMLOptionElement>) {
    return (
      <option
        {...props}
        className="bg-[#07140f] text-dim hover:bg-dim hover:text-cream"
      >
        {children}
      </option>
    )
  }