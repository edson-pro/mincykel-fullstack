import React from "react";
import { Bike } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Bike className={cn("h-8 w-8 text-primary", className)} />
      <span className={cn("text-[20px] text-primary font-bold", className)}>
        MinCykel
      </span>
    </Link>
  );
}
