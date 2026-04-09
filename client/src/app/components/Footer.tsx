'use client';

import Link from 'next/link';
import { Instagram, Facebook, Youtube, Linkedin, Twitter } from 'lucide-react';

const FOOTER_LINKS = {
    column1: [
        { label: 'Home', href: '/' },
        { label: 'Privacy policy', href: '/privacy' },
        { label: 'Terms of service', href: '/terms' },
        { label: 'Contact us', href: '/contact' },
    ],
    column2: [
        { label: 'About us', href: '/about' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Resources', href: '/resources' },
    ],
};

const SOCIAL_LINKS = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'X' },
];

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    {/* Newsletter Intake */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">Souvenote</h3>
                            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                                Sign up for new card updates and promotions. Stay connected with the latest AI-powered card designs.
                            </p>
                        </div>
                        <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                            />
                            <button className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
                                Join
                            </button>
                        </form>
                    </div>

                    {/* Navigation Columns */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-2">
                        <div className="space-y-4">
                            {FOOTER_LINKS.column1.map((link) => (
                                <Link 
                                    key={link.label} 
                                    href={link.href}
                                    className="block text-sm text-gray-400 hover:text-black transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {FOOTER_LINKS.column2.map((link) => (
                                <Link 
                                    key={link.label} 
                                    href={link.href}
                                    className="block text-sm text-gray-400 hover:text-black transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-gray-400" suppressHydrationWarning>
                        © {new Date().getFullYear()} Souvenote. All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-6">
                        {SOCIAL_LINKS.map((social) => (
                            <Link 
                                key={social.label} 
                                href={social.href}
                                aria-label={social.label}
                                className="text-gray-400 hover:text-black transition-colors"
                            >
                                <social.icon className="w-5 h-5" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
