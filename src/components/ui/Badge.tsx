import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GiveawayStatus, SessionType } from "@/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  status?: GiveawayStatus;
  type?: SessionType;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ status, type, className, children }: BadgeProps) {
  let variantClass = "bg-gray-800 text-gray-300";
  let content = children;

  if (status) {
    content = status.toUpperCase();
    switch (status) {
      case "live":
        variantClass = "bg-green-500/20 text-green-400 border border-green-500/50 animate-pulse";
        break;
      case "scheduled":
        variantClass = "bg-blue-500/20 text-blue-400 border border-blue-500/50";
        break;
      case "ended":
        variantClass = "bg-gray-500/20 text-gray-400 border border-gray-500/50";
        break;
      case "draft":
        variantClass = "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50";
        break;
    }
  } else if (type) {
    content = type.toUpperCase();
    switch (type) {
      case "practice":
        variantClass = "bg-purple-500/20 text-purple-400 border border-purple-500/50";
        break;
      case "official":
        variantClass = "bg-amber-500/20 text-amber-400 border border-amber-500/50 text-glow";
        break;
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
        variantClass,
        className
      )}
    >
      {content}
    </span>
  );
}
