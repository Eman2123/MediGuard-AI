import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-105"
      >
        {/* Shield Base - Medical Teal */}
        <path 
          d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" 
          fill="#0D9488" 
        />
        {/* Medical/Pulse Line inside - White */}
        <path 
          d="M7 12h2.5l1-2.5 2 5 1-2.5H17" 
          stroke="#FFFFFF" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>

      <span className="font-display text-lg font-bold tracking-tight text-white">
        MediGuard <span className="text-signal-light">AI</span>
      </span>
    </Link>
  );
}