"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: "xs" | "sm" | "md";
  readOnly?: boolean;
  showValue?: boolean;
  count?: number;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  showValue = false,
  count,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  const sizeMap = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6",
  };
  const px = sizeMap[size];

  const textSizeMap = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hover || value) >= star;
          // Support half-star display: if readOnly and value is e.g. 3.5
          const isHalf = readOnly && !hover && value >= star - 0.5 && value < star;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !readOnly && setHover(star)}
              onMouseLeave={() => !readOnly && setHover(0)}
              className={cn(
                "transition-transform duration-150 p-0 border-0 bg-transparent",
                !readOnly && "hover:scale-110 cursor-pointer",
                readOnly && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  px,
                  "transition-colors duration-150",
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : isHalf
                      ? "fill-amber-400/50 text-amber-400"
                      : "text-gray-300 dark:text-gray-600"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && value > 0 && (
        <span className={cn("font-semibold text-amber-600 dark:text-amber-400", textSizeMap[size])}>
          {Number(value).toFixed(1)}
        </span>
      )}
      {count !== undefined && count > 0 && (
        <span className={cn("text-[#9CA3AF]", textSizeMap[size])}>
          ({count})
        </span>
      )}
    </div>
  );
}
