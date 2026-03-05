'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/cards');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return null;
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center font-sans text-[#111111]">
            <h1 className="text-5xl font-bold tracking-tight">Souvenote</h1>
            <p className="text-gray-500 text-sm mt-3">A card worth keeping</p>
        </main>
    );
}
