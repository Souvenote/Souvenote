'use client';

export type CardAction = 'select' | 'personalize' | 'build';
export type CardFormat = 'physical' | 'digital';

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (format: CardFormat) => void;
}

export default function FormatModal({ open, onClose, onSelect }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="font-bold text-xl">Choose your card format</h3>
                    <p className="text-sm text-gray-500">
                        Select whether you want a physical card or digital card
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onSelect('physical')}
                        className="border-2 border-gray-200 rounded-xl p-5 text-left hover:border-black transition-colors space-y-1 group"
                    >
                        <div className="font-semibold text-sm group-hover:text-black transition-colors">
                            Physical Card
                        </div>
                        <div className="text-xl font-bold">CDN $9.99</div>
                        <div className="text-xs text-gray-400">includes shipping</div>
                    </button>

                    <button
                        onClick={() => onSelect('digital')}
                        className="border-2 border-gray-200 rounded-xl p-5 text-left hover:border-black transition-colors space-y-1 group"
                    >
                        <div className="font-semibold text-sm group-hover:text-black transition-colors">
                            Digital Card
                        </div>
                        <div className="text-xl font-bold">CDN $2.99</div>
                        <div className="text-xs text-gray-400">instant delivery</div>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
