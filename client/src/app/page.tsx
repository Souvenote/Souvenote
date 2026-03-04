'use client';

import { useAuth } from '@/context/AuthContext';

export default function Home() {
    const { user, loading, logout } = useAuth();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 font-sans text-[#111111]">
            <h1 className="text-4xl font-bold">Souvenote</h1>

            {!loading && user && (
                <>
                    <p className="text-sm text-gray-500">
                        You&apos;re logged in as <span className="font-medium text-[#111111]">{user.email}</span>
                    </p>
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Sign out
                    </button>
                </>
            )}
        </main>
    );
}
