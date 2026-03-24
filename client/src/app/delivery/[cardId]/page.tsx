'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { deliveryApi, type DeliveryRecord } from '@/lib/api';

interface PhysicalFormState {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export default function DeliveryPage() {
  const params = useParams<{ cardId: string }>();
  const cardId = Array.isArray(params.cardId) ? params.cardId[0] : params.cardId;
  const [delivery, setDelivery] = useState<DeliveryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [shippingAddress, setShippingAddress] = useState<PhysicalFormState>({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada',
  });

  useEffect(() => {
    if (!cardId) {
      setLoadError('Card not found.');
      setIsLoading(false);
      return;
    }

    let ignore = false;

    const loadDelivery = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const record = await deliveryApi.getCard(cardId);

        if (!ignore) {
          setDelivery(record);
          setRecipientName(record.recipientName || record.personalizationData?.recipientName || '');
          setRecipientEmail(record.recipientEmail || '');
          setDeliveryMessage(record.deliveryMessage || '');
          setShippingAddress({
            fullName: record.shippingAddress?.fullName || record.recipientName || '',
            line1: record.shippingAddress?.line1 || '',
            line2: record.shippingAddress?.line2 || '',
            city: record.shippingAddress?.city || '',
            province: record.shippingAddress?.province || '',
            postalCode: record.shippingAddress?.postalCode || '',
            country: record.shippingAddress?.country || 'Canada',
          });
        }
      } catch (error) {
        if (!ignore) {
          setLoadError(error instanceof Error ? error.message : 'Could not load delivery details.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadDelivery();

    return () => {
      ignore = true;
    };
  }, [cardId]);

  const cardTitle = useMemo(
    () =>
      delivery?.template?.title ||
      delivery?.personalizationData?.templateTitle ||
      delivery?.personalizationData?.occasion ||
      'Your card',
    [delivery],
  );

  const previewEmoji = delivery?.template?.previewEmoji || (delivery?.format === 'physical' ? '💌' : '✨');

  const handleCopyLink = async () => {
    if (!delivery?.shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(delivery.shareUrl);
      setSuccessMessage('Share link copied to your clipboard.');
    } catch {
      setSuccessMessage('Copy failed. You can still copy the link manually below.');
    }
  };

  const submitDigitalDelivery = async () => {
    if (!cardId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const record = await deliveryApi.saveDigital(cardId, {
        recipientName: recipientName.trim() || undefined,
        recipientEmail: recipientEmail.trim() || undefined,
        deliveryMessage: deliveryMessage.trim() || undefined,
      });
      setDelivery(record);
      setSuccessMessage('Digital delivery is ready. Your share link is live below.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save digital delivery.');
    } finally {
      setIsSaving(false);
    }
  };

  const submitPhysicalDelivery = async () => {
    if (!cardId) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const record = await deliveryApi.savePhysical(cardId, {
        recipientName: recipientName.trim() || undefined,
        deliveryMessage: deliveryMessage.trim() || undefined,
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          line1: shippingAddress.line1.trim(),
          line2: shippingAddress.line2.trim() || undefined,
          city: shippingAddress.city.trim(),
          province: shippingAddress.province.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim() || 'Canada',
        },
      });
      setDelivery(record);
      setSuccessMessage('Shipping details saved. Physical fulfillment can use this address later.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save shipping details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] px-6 py-10 text-[#111111]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Delivery</p>
            <h1 className="mt-2 text-3xl font-bold">Send your card</h1>
          </div>
          <Link
            href="/my-cards"
            className="inline-flex rounded-xl border border-[#ddd3c6] px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#f8f3ec]"
          >
            Back to My Cards
          </Link>
        </div>

        {loadError ? (
          <section className="rounded-[2rem] border border-rose-200 bg-white px-6 py-8 text-rose-700 shadow-sm">
            {loadError}
          </section>
        ) : isLoading ? (
          <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <div className="h-[420px] animate-pulse rounded-[2rem] border border-[#e9e1d5] bg-white shadow-sm" />
            <div className="h-[420px] animate-pulse rounded-[2rem] border border-[#e9e1d5] bg-white shadow-sm" />
          </section>
        ) : delivery ? (
          <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[2rem] border border-[#e9e1d5] bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">Card preview</p>
              <div className="mt-5 overflow-hidden rounded-[2rem] border border-[#efe7db] bg-[#fcfaf7]">
                {delivery.template?.thumbnailUrl || delivery.template?.imageUrl ? (
                  <img
                    src={delivery.template.thumbnailUrl || delivery.template.imageUrl}
                    alt={cardTitle}
                    className="aspect-[5/7] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[5/7] items-center justify-center bg-gradient-to-br from-[#fff8ef] via-[#fcfaf7] to-[#f4ecdf] text-7xl">
                    {previewEmoji}
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <h2 className="text-2xl font-bold">{cardTitle}</h2>
                <p className="text-sm text-gray-500">
                  {delivery.personalizationData?.occasion || delivery.template?.occasion || 'Souvenote keepsake'}
                </p>
                <div className="rounded-2xl border border-[#e9e1d5] bg-[#fcfaf7] px-4 py-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-[#111111]">Format:</span> {delivery.format}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-[#111111]">Song attached:</span>{' '}
                    {delivery.songId ? 'Yes' : 'No'}
                  </p>
                  <p className="mt-2">
                    <span className="font-semibold text-[#111111]">Delivery status:</span>{' '}
                    {delivery.deliveryStatus.replace(/_/g, ' ')}
                  </p>
                </div>

                {delivery.personalizationData?.personalMessage && (
                  <div className="rounded-2xl border border-[#e9e1d5] bg-[#fcfaf7] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Personal message
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {delivery.personalizationData.personalMessage}
                    </p>
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-[2rem] border border-[#e9e1d5] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                  {delivery.format === 'digital' ? 'Digital delivery' : 'Physical delivery'}
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                  {delivery.format === 'digital' ? 'Share by link or email' : 'Capture shipping details'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {delivery.format === 'digital'
                    ? 'Generate a shareable link now. Recipient email is optional and can be added whenever you want.'
                    : 'Physical shipping is not processed yet, but the address is saved so the fulfillment flow has the right details later.'}
                </p>
              </div>

              {saveError && (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {saveError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {successMessage}
                </div>
              )}

              {delivery.format === 'digital' ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Recipient name
                    </label>
                    <input
                      value={recipientName}
                      onChange={(event) => setRecipientName(event.target.value)}
                      className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                      placeholder="e.g. Sarah"
                    />
                  </div>

                  <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Recipient email (optional)
                      </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(event) => setRecipientEmail(event.target.value)}
                      className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Delivery note
                    </label>
                    <textarea
                      rows={4}
                      value={deliveryMessage}
                      onChange={(event) => setDeliveryMessage(event.target.value)}
                      className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                      placeholder="A short note to include with the share"
                    />
                  </div>

                  <button
                    onClick={() => void submitDigitalDelivery()}
                    disabled={isSaving}
                    className="inline-flex rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Create share link'}
                  </button>

                  {delivery.shareUrl && (
                    <div className="rounded-2xl border border-[#e9e1d5] bg-[#fcfaf7] px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Share link
                      </p>
                      <p className="mt-3 break-all text-sm text-gray-600">{delivery.shareUrl}</p>
                      <button
                        onClick={() => void handleCopyLink()}
                        className="mt-4 inline-flex rounded-xl border border-[#ddd3c6] px-4 py-2 text-sm font-semibold text-[#111111] transition-colors hover:bg-white"
                      >
                        Copy link
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Recipient name
                    </label>
                    <input
                      value={recipientName}
                      onChange={(event) => setRecipientName(event.target.value)}
                      className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                      placeholder="e.g. Sarah"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Full name for shipment
                      </label>
                      <input
                        value={shippingAddress.fullName}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, fullName: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="Full name"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Address line 1
                      </label>
                      <input
                        value={shippingAddress.line1}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, line1: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="Street address"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Address line 2
                      </label>
                      <input
                        value={shippingAddress.line2}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, line2: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="Apartment, unit, suite (optional)"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        City
                      </label>
                      <input
                        value={shippingAddress.city}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, city: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="City"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Province
                      </label>
                      <input
                        value={shippingAddress.province}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, province: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="Province"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Postal code
                      </label>
                      <input
                        value={shippingAddress.postalCode}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, postalCode: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="Postal code"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                        Country
                      </label>
                      <input
                        value={shippingAddress.country}
                        onChange={(event) => setShippingAddress((current) => ({ ...current, country: event.target.value }))}
                        className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7760]">
                      Fulfillment note
                    </label>
                    <textarea
                      rows={4}
                      value={deliveryMessage}
                      onChange={(event) => setDeliveryMessage(event.target.value)}
                      className="w-full rounded-xl border border-[#ddd3c6] px-4 py-3 text-sm outline-none transition-colors focus:border-[#111111]"
                      placeholder="Internal note for fulfillment later"
                    />
                  </div>

                  <button
                    onClick={() => void submitPhysicalDelivery()}
                    disabled={
                      isSaving ||
                      !shippingAddress.fullName.trim() ||
                      !shippingAddress.line1.trim() ||
                      !shippingAddress.city.trim() ||
                      !shippingAddress.province.trim() ||
                      !shippingAddress.postalCode.trim()
                    }
                    className="inline-flex rounded-xl bg-[#111111] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save shipping details'}
                  </button>
                </div>
              )}
            </article>
          </section>
        ) : null}
      </div>
    </main>
  );
}
