export default function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7 text-frost print:text-black" aria-hidden>
        <path
          d="M16 4l10 3.8v7.8c0 6-4.1 10.5-10 12.4C10.1 26.1 6 21.6 6 15.6V7.8L16 4z"
          fill="rgb(186 214 247 / 0.08)"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M11.3 16.2l3.3 3.2 6.1-6.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-[17px] font-medium tracking-tight text-ice print:text-black">
        SafeSite <span className="text-skywash">AI</span>
      </span>
    </span>
  )
}
