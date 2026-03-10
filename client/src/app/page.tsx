import Link from 'next/link';
import CardCarousel from './components/CardCarousel';
import FAQAccordion from './components/FAQAccordion';

const STAY_IN_TOUCH = ['Home', 'My images', 'Terms', 'Contact us', 'Legal'];
const COMPANY = ['About', 'Pricing', 'FAQ', 'Resources'];

const SOCIAL = [
    {
        label: 'Facebook',
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
    },
    {
        label: 'Instagram',
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        label: 'X',
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        label: 'LinkedIn',
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        ),
    },
    {
        label: 'YouTube',
        icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
    },
];

export default function Home() {
    return (
        <main className="text-[#111111]">

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="bg-white py-20 px-6 flex flex-col items-center text-center gap-6">
                {/* Large company logo */}
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-black text-white">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold leading-tight max-w-xl">
                    A card worth keeping
                </h1>
                <p className="text-gray-500 text-base leading-relaxed max-w-md">
                    Generate personalized cards and custom songs. Because the card you send should be as unique as they are.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mt-2">
                    <Link
                        href="/signup"
                        className="relative bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors animate-pulse"
                    >
                        Start for Free
                        <span className="block text-[10px] font-normal text-gray-300 mt-0.5">
                            Includes 1 free image generation and 1 free song
                        </span>
                    </Link>
                    <Link
                        href="/login"
                        className="border border-gray-300 text-[#111] px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors self-center"
                    >
                        Log In
                    </Link>
                </div>
            </section>

            {/* ── Example Cards Carousel ────────────────────────────── */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12 space-y-3">
                        <h2 className="text-3xl font-bold">Example cards</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
                            Browse greeting cards made with Souvenote, each built with AI-generated images and a personalized song.
                        </p>
                    </div>
                    <CardCarousel />
                </div>
            </section>

            {/* ── Explainer Video ───────────────────────────────────── */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="relative bg-gray-200 rounded-2xl aspect-video flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                        <button className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 px-3 py-1.5 rounded-full hover:bg-white transition-colors">
                            Skip for now
                        </button>
                    </div>
                </div>
            </section>

            {/* ── How It Works ──────────────────────────────────────── */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12 space-y-3">
                        <h2 className="text-3xl font-bold">How it works</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {[
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                ),
                                step: '1',
                                title: 'Choose from a template or answer a few questions',
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                ),
                                step: '2',
                                title: "We'll create your card and a personalized song",
                            },
                            {
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                ),
                                step: '3',
                                title: 'We print it and send it',
                            },
                        ].map(({ icon, step, title }) => (
                            <div key={step} className="flex flex-col items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                                    {icon}
                                </div>
                                <span className="text-xs font-bold tracking-widest text-gray-300">STEP {step}</span>
                                <h3 className="font-semibold text-sm leading-snug max-w-[180px]">{title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ────────────────────────────────────────────────── */}
            <section className="py-20">
                <div className="max-w-2xl mx-auto px-6">
                    <div className="text-center mb-10 space-y-3">
                        <h2 className="text-3xl font-bold">Questions</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Find answers to common questions about creating and sending cards with Souvenote.
                        </p>
                    </div>
                    <FAQAccordion />
                    <div className="text-center mt-10">
                        <Link
                            href="/faq"
                            className="inline-block border border-gray-300 text-sm px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            View all FAQs
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <footer className="border-t border-gray-100 py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        {/* Newsletter */}
                        <div className="space-y-4">
                            <div className="font-bold text-lg">Souvenote</div>
                            <p className="text-sm text-gray-500">Get updates on new card designs and features.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Your e-mail address"
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
                                />
                                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors whitespace-nowrap">
                                    Subscribe
                                </button>
                            </div>
                            <p className="text-xs text-gray-400">We&apos;ll never share your details with others.</p>
                        </div>

                        {/* Link columns */}
                        <div className="grid grid-cols-3 gap-6 text-sm">
                            <div className="space-y-3">
                                <h4 className="font-semibold">Stay in touch</h4>
                                <ul className="space-y-2 text-gray-500">
                                    {STAY_IN_TOUCH.map((label) => (
                                        <li key={label}>
                                            <Link href="/" className="hover:text-black transition-colors">
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold">Company</h4>
                                <ul className="space-y-2 text-gray-500">
                                    {COMPANY.map((label) => (
                                        <li key={label}>
                                            <Link href="/" className="hover:text-black transition-colors">
                                                {label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-semibold">Support</h4>
                                <ul className="space-y-3 text-gray-500">
                                    {SOCIAL.map(({ label, icon }) => (
                                        <li key={label}>
                                            <Link
                                                href="/"
                                                className="flex items-center gap-2 hover:text-black transition-colors"
                                            >
                                                {icon}
                                                <span>{label}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
                        <span>© 2025 Souvenote. All rights reserved.</span>
                        <div className="flex gap-4">
                            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
                            <Link href="/cookies" className="hover:text-black transition-colors">Cookies</Link>
                            <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
