'use client';

import { useState } from 'react';

interface Props {
    type: 'caption' | 'message';
    onSelect: (text: string) => void;
}

const HEADINGS = {
    caption: {
        title: 'Caption Generator',
        subtext: "Type your idea and let me help you how to say it",
    },
    message: {
        title: 'Message Generator',
        subtext: "Type your idea and let me help you how to say it",
    },
};

interface ChatEntry {
    role: 'user' | 'assistant';
    content: string;
}

export default function AiChatBot({ type, onSelect }: Props) {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<ChatEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const heading = HEADINGS[type];

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const userEntry: ChatEntry = { role: 'user', content: trimmed };
        const updatedHistory = [...history, userEntry];
        setHistory(updatedHistory);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: trimmed, type }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? 'Generation failed');
            }

            const data = await response.json();
            const assistantEntry: ChatEntry = { role: 'assistant', content: data.result };
            setHistory([...updatedHistory, assistantEntry]);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Something went wrong';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <div>
                <h4 className="font-bold text-sm">{heading.title}</h4>
                <p className="text-xs text-gray-500">{heading.subtext}</p>
            </div>

            {/* Chat history */}
            {history.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {history.map((entry, i) => (
                        <div key={i} className={`text-xs leading-relaxed ${entry.role === 'user' ? 'text-gray-600' : 'text-black'}`}>
                            {entry.role === 'assistant' ? (
                                <div className="space-y-1.5">
                                    {entry.content.split('\n').filter(Boolean).map((line, j) => (
                                        <button
                                            key={j}
                                            type="button"
                                            onClick={() => onSelect(line.replace(/^\d+\.\s*/, ''))}
                                            className="block w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            {line}
                                            <span className="block text-[10px] text-gray-400 mt-0.5">Click to use</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">You: {entry.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {error && <p className="text-xs text-red-500">{error}</p>}

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={type === 'caption' ? 'e.g. funny birthday for my best friend' : 'e.g. heartfelt thank you to my mom'}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-gray-400 transition-colors"
                />
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-3 py-2 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? '...' : 'Generate'}
                </button>
            </div>
        </div>
    );
}
