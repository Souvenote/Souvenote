import Link from 'next/link';
import CardCarousel from './components/CardCarousel';
import FAQAccordion from './components/FAQAccordion';


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

        </main>
    );
}

