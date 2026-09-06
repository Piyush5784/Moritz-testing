"use client";

import type { ComponentProps, CSSProperties, ReactNode, Ref } from "react";
import { AutoHideScroll } from "@/components/auto-hide-scroll";
import { Table } from "@/components/ui/table";
import { cn } from "cn";

export function DataTableShell({
  children,
  className,
  scrollClassName,
  scrollStyle,
  scrollRef,
  ...props
}: {
  children: ReactNode;
  className?: string;
  scrollClassName?: string;
  scrollStyle?: CSSProperties;
  scrollRef?: Ref<HTMLDivElement>;
} & Omit<ComponentProps<typeof Table>, "className" | "children">) {
  return (
    <AutoHideScroll
      ref={scrollRef}
      className={cn(
        "**:data-[slot=table-container]:overflow-visible",
        scrollClassName
      )}
      style={scrollStyle}
    >
      <Table className={cn(className)} {...props}>
        {children}
      </Table>
    </AutoHideScroll>
  );
}

export const stickyTableHeadClassName =
  "sticky top-0 z-10 bg-card";
