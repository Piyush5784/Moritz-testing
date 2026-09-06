"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedItem } from "@/components/ui-bits/feed-item";
import type { ActivityItem } from "@/lib/supabase";

const PREVIEW = 8;

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayLabel(iso: string, now = new Date()) {
  const d = new Date(iso);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (today.getTime() - that.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function groupByDay(items: ActivityItem[]) {
  const groups: { key: string; label: string; items: ActivityItem[] }[] = [];
  const index = new Map<string, number>();

  for (const item of items) {
    const key = dayKey(item.at);
    const existing = index.get(key);
    if (existing === undefined) {
      index.set(key, groups.length);
      groups.push({ key, label: dayLabel(item.at), items: [item] });
    } else {
      groups[existing].items.push(item);
    }
  }

  return groups;
}

export function ActivityFeed({
  activity,
  filter,
}: {
  activity: ActivityItem[];
  filter: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [filterForExpanded, setFilterForExpanded] = useState(filter);
  if (filter !== filterForExpanded) {
    setFilterForExpanded(filter);
    setExpanded(false);
  }

  const filtered = useMemo(() => {
    if (filter === "all") return activity;
    return activity.filter((a) => a.verb === filter);
  }, [activity, filter]);

  const visible = expanded ? filtered : filtered.slice(0, PREVIEW);
  const groups = groupByDay(visible);
  const canShowMore = !expanded && filtered.length > PREVIEW;

  if (filtered.length === 0) {
    return (
      <p
        className="py-6 text-center text-text-secondary"
        style={{ fontSize: "var(--text-12)" }}
      >
        Nothing here today.
      </p>
    );
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.key}>
          <div
            className="font-medium text-text-tertiary"
            style={{
              fontSize: "var(--text-11)",
              marginTop: "8px",
              marginBottom: "4px",
            }}
          >
            {group.label}
          </div>
          <ul>
            {group.items.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </ul>
        </div>
      ))}
      {canShowMore ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => setExpanded(true)}
          onMouseEnter={() => setExpanded(true)}
        >
          Show more
        </Button>
      ) : null}
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="mt-2 space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[auto_1fr_auto] items-start gap-2 py-2"
        >
          <Skeleton className="mt-2 size-1.5 rounded-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  );
}
