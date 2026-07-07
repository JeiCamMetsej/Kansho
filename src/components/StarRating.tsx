"use client";

interface StarRatingProps {
  rating: number | null;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  disabled?: boolean;
}

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

const SIZE_MAP = {
  sm: { dim: 14, btn: "w-3.5 h-3.5" },
  md: { dim: 20, btn: "w-5 h-5" },
  lg: { dim: 24, btn: "w-6 h-6" },
};

export default function StarRating({
  rating,
  size = "md",
  interactive = false,
  onRate,
  disabled = false,
}: StarRatingProps) {
  const { dim, btn } = SIZE_MAP[size];

  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rating !== null && rating >= star;
        const isHalf = rating !== null && rating === star - 0.5;
        const fillColor = "var(--text-primary)";
        const emptyColor = "var(--border-primary)";

        return (
          <button
            key={star}
            type="button"
            onClick={(e) => {
              if (!interactive || !onRate) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const half = x < rect.width / 2;
              onRate(half ? star - 0.5 : star);
            }}
            disabled={disabled || !interactive}
            className={`relative ${btn} flex items-center justify-center ${
              interactive              ? "cursor-pointer active:scale-75"
              : ""
            } disabled:cursor-not-allowed`}
            title={interactive ? `${star - 0.5} ★ – ${star} ★` : undefined}
          >
            {/* Base star — outline (empty) */}
            <svg
              width={dim}
              height={dim}
              viewBox="0 0 24 24"
              className="absolute inset-0 m-auto"
              style={{ display: "block" }}
            >
              <path
                d={STAR_PATH}
                fill="none"
                stroke={isFull || isHalf ? fillColor : emptyColor}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>

            {/* Filled fill — full star */}
            {isFull && (
              <svg
                width={dim}
                height={dim}
                viewBox="0 0 24 24"
                className="absolute inset-0 m-auto"
                style={{ display: "block" }}
              >
                <path
                  d={STAR_PATH}
                  fill={fillColor}
                  stroke="none"
                />
              </svg>
            )}

            {/* Filled fill — half star (left 50% visible, right clipped) */}
            {isHalf && (
              <div
                className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                style={{ width: "50%" }}
              >
                <svg
                  width={dim}
                  height={dim}
                  viewBox="0 0 24 24"
                  style={{ display: "block" }}
                >
                  <path
                    d={STAR_PATH}
                    fill={fillColor}
                    stroke="none"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
