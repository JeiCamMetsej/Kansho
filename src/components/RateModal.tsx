"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import StarRating from "./StarRating";

interface RateModalProps {
  currentRating: number | null;
  currentReview: string | null;
  onSave: (rating: number | null, review: string | null) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export default function RateModal({
  currentRating,
  currentReview,
  onSave,
  onClose,
  loading,
}: RateModalProps) {
  const [rating, setRating] = useState<number | null>(currentRating);
  const [review, setReview] = useState<string>(currentReview ?? "");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

  const handleSave = useCallback(async () => {
    await onSave(rating, review.trim() || null);
  }, [rating, review, onSave]);

  const handleClear = useCallback(async () => {
    await onSave(null, null);
  }, [onSave]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal — slides up from bottom on mobile */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-sm sm:mx-4 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-t-3xl sm:rounded-3xl shadow-xl outline-none pb-safe"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-light text-[var(--text-primary)]">
              Rate & Review
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-xl text-[var(--text-tertiary)] transition-all duration-150 active:bg-[var(--bg-secondary)] active:text-[var(--text-primary)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stars */}
          <div className="flex flex-col items-center gap-2">
            <StarRating
              rating={rating}
              interactive
              onRate={setRating}
              disabled={loading}
              size="lg"
            />
            {rating !== null && (
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {rating % 1 === 0 ? `${rating}.0` : `${rating}`} / 5
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--border-primary)]" />

          {/* Opinion textarea */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Your opinion
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think?"
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none focus:border-[var(--text-secondary)] transition-colors disabled:opacity-50"
              maxLength={500}
            />
            <p className="text-[10px] text-[var(--text-tertiary)] text-right">
              {review.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleClear}
              disabled={loading || (rating === null && !review)}
              className="px-4 h-11 text-xs font-semibold uppercase tracking-wider rounded-xl text-[var(--text-tertiary)] transition-all duration-150 active:text-[var(--text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-5 h-11 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] border border-[var(--border-primary)] rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-5 h-11 text-xs font-semibold uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Saving…" : rating === null && !review ? "Remove" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
