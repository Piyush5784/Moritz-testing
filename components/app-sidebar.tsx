"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";

const navItems = [
  { title: "Overview", href: "/", icon: LayoutDashboard },
  { title: "Matters", href: "/matters", icon: FileText },
  { title: "Lawyers", href: "/lawyers", icon: Users },
  { title: "Clients", href: "/clients", icon: Building2 },
  { title: "Finance", href: "/finance", icon: TrendingUp },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

const emptySubscribe = () => () => {};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-primary-foreground"
            style={{ background: "var(--brand)" }}
            aria-hidden
          >
            <span
              className="font-semibold leading-none"
              style={{ fontSize: "var(--text-12)" }}
            >
              M
            </span>
          </div>
          <span
            className="font-semibold text-foreground group-data-[collapsible=icon]:hidden"
            style={{ fontSize: "var(--text-14)" }}
          >
            Moritz
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <nav aria-label="Primary">
              <SidebarMenu>
                {navItems.map((item) => {
                  const active =
                    mounted &&
                    (item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={
                          active
                            ? "h-[34px] rounded-md bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            : "h-[34px] rounded-md text-sidebar-foreground hover:bg-surface-hover hover:text-sidebar-foreground"
                        }
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-3">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
