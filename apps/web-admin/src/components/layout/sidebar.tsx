"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  Mail,
  Shield,
  Building2,
  Calendar,
  Dumbbell,
  GraduationCap,
  BookOpen,
  FileCheck,
  ClipboardList,
  Bell,
  Upload,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Anggota", href: "/anggota", icon: Users },
  { label: "Iuran", href: "/iuran", icon: Wallet },
  { label: "Organisasi", href: "/organisasi", icon: Building2 },
  { label: "Kegiatan", href: "/kegiatan", icon: Calendar },
  { label: "Latihan", href: "/latihan", icon: Dumbbell },
];

const secondaryNav: NavItem[] = [
  { label: "Konten", href: "/konten", icon: FileText },
  { label: "Surat", href: "/surat", icon: Mail },
  { label: "Pendadaran", href: "/pendadaran", icon: GraduationCap },
  { label: "Pustaka", href: "/pustaka", icon: BookOpen },
  { label: "Dokumen", href: "/dokumen", icon: FileCheck },
  { label: "Users & Roles", href: "/users", icon: Shield },
  { label: "Audit Trail", href: "/audit", icon: ClipboardList },
  { label: "Notifikasi", href: "/notifications", icon: Bell },
  { label: "Import Data", href: "/import-jobs", icon: Upload },
  { label: "Dok. Organisasi", href: "/organisasi-dokumen", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <img src="/favicon.svg" alt="THS-THM" className="h-8 w-8" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">THS THM Admin</span>
        )}
      </div>

      <Separator />

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Utama
            </p>
          )}
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <Separator className="my-3" />

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lainnya
            </p>
          )}
          {secondaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Collapse toggle */}
      <Separator />
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
