'use client';

export type CardAction = 'select' | 'personalize' | 'build';
export type CardFormat = 'physical';

interface Props {
    open: boolean;
    onClose: () => void;
    onSelect: (format: CardFormat) => void;
    price?: string;
    subtitle?: string;
}

export default function FormatModal({
    open,
    onClose,
    onSelect,
    price = 'CDN $9.99',
    subtitle = 'includes shipping',
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
                <div className="text-center space-y-2">
                    <h3 className="font-bold text-xl">Confirm your card</h3>
                    <p className="text-sm text-gray-500">
                        We are sending physical cards only for this flow.
                    </p>
                </div>

                <div className="rounded-2xl border-2 border-gray-200 p-6 text-left shadow-sm space-y-2">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                        Physical card
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{price}</div>
                    <div className="text-sm text-gray-500">{subtitle}</div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onSelect('physical')}
                        className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                    >
                        Continue with Physical Card
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
