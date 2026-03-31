"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  MessageSquare,
  Activity,
  LayoutGrid,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { name: "Workspace", href: "/dashboard", icon: LayoutGrid },
  { name: "Lobby", href: "/lobby", icon: Terminal },
  { name: "Leaderboard", href: "/leaderboard", icon: Activity },
  { name: "History", href: "/history", icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="h-screen w-72 flex-col border-r border-[#E3E2E2] dark:border-[#1C1B1B] bg-[#F4F3F3] dark:bg-[#141414] py-8 space-y-2 z-[90] hidden lg:flex font-sans">
      {/* Logo / Brand - moved to top nav in design but we can keep user profile here */}
      <div className="px-8 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#F4F3F3] dark:bg-[#1C1B1B] rounded-full flex items-center justify-center overflow-hidden">
             {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
             ) : (
                <div className="text-xs font-bold text-[#0A0A0A] dark:text-white">{user?.username?.slice(0, 2).toUpperCase() || 'UN'}</div>
             )}
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest font-bold text-[#0A0A0A] dark:text-white">
              {user?.username || "Guest"}
            </p>
            <p className="text-[10px] text-[#5F5E5E] dark:text-[#A1A1A1] font-medium tracking-widest">
              RATING {user?.rating || 1200}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 mx-4 transition-colors font-sans text-sm uppercase tracking-widest font-semibold rounded-sm",
                isActive
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                  : "text-[#5F5E5E] dark:text-[#A1A1A1] hover:bg-[#E3E2E2] dark:hover:bg-[#1C1B1B]"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto px-8 space-y-4">
        <button className="w-full bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] py-4 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:translate-x-1 transition-all" onClick={() => window.location.href = '/lobby'}>
          <Plus className="w-5 h-5" /> New Clash
        </button>
        <button onClick={logout} className="w-full text-[#5F5E5E] dark:text-[#A1A1A1] py-4 rounded-sm font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#E3E2E2] dark:hover:bg-[#1C1B1B] transition-all">
          <LogOut className="w-4 h-4" /> Disconnect
        </button>
      </div>
    </aside>
  );
}
