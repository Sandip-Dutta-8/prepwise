"use client";

const SOCIALS = [
    {
        label: "GitHub",
        href: "https://github.com/Sandip-Dutta-8",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.26 5.69.41.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
        ),
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/sandip-dutta-50415b25a/",
        svg: (
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
            </svg>
        ),
    },
] as const;

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black">
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-stone-500 font-light">
                    Built by{" "}
                    <span className="group relative inline-block font-serif text-stone-300">
                        Sandip Dutta
                        <span className="absolute left-0 -bottom-0.5 h-px w-full bg-amber-400 scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100" />
                    </span>
                </p>

                <div className="flex items-center gap-2">
                    {SOCIALS.map(({ label, href, svg }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={label}
                            className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-stone-500 hover:text-amber-400 hover:border-amber-400/20 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {svg}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}