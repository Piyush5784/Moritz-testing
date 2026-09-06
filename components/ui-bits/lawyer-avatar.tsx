"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "cn";

const sizeClass = {
  sm: "!size-6",
  md: "!size-7",
  lg: "!size-9",
} as const;

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function LawyerAvatar({
  lawyerId,
  name,
  initials,
  size = "md",
  className,
}: {
  lawyerId: string;
  name: string;
  initials?: string | null;
  size?: keyof typeof sizeClass;
  className?: string;
}) {
  const label = initials?.trim() || initialsFromName(name);

  return (
    <Avatar
      className={cn(
        sizeClass[size],
        "rounded-[9px] after:rounded-[9px]",
        className
      )}
      aria-hidden
    >
      <AvatarImage
        src={`https://i.pravatar.cc/64?u=${encodeURIComponent(lawyerId)}`}
        alt=""
        className="rounded-[inherit]"
      />
      <AvatarFallback
        className="rounded-[inherit] font-semibold"
        style={{
          background: "var(--accent)",
          color: "var(--accent-foreground)",
          fontSize: "var(--text-11)",
        }}
      >
        {label}
      </AvatarFallback>
    </Avatar>
  );
}
