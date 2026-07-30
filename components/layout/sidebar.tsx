"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";

const primary: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Inventory", href: "/inventory", icon: "inventory" },
  { label: "Attention", href: "/attention", icon: "warning" },
];
const workspace: { label: string; href: string; icon: IconName }[] = [
  { label: "Sales", href: "/sales", icon: "sales" }, { label: "Stock planning", href: "/operations", icon: "sparkles" },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <aside className={mobile ? "block" : "hidden h-screen w-[248px] shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:block"}>
    <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
      <div className="grid size-9 place-items-center rounded-xl bg-[#163f35] text-sm font-semibold text-white">V</div>
      <div><p className="text-[15px] font-semibold tracking-tight text-slate-900">Vasudha Foods</p><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Command Center</p></div>
    </div>
    <nav className="flex h-[calc(100%-5rem)] flex-col px-3 py-5" aria-label="Main navigation">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">Overview</p>
      {primary.map((item) => { const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active ? "bg-[#eaf3ef] text-[#164c3d]" : "text-slate-600 hover:bg-slate-50"}`}><Icon name={item.icon} className="size-[18px]"/>{item.label}</Link>; })}
      <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">Workspace</p>
      {workspace.map((item) => { const active=pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${active?"bg-[#eaf3ef] text-[#164c3d]":"text-slate-600 hover:bg-slate-50"}`}><Icon name={item.icon} className="size-[18px]"/>{item.label}</Link>; })}
      <div className="mt-auto border-t border-slate-100 pt-3"><Link href="/settings" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname.startsWith("/settings")?"bg-[#eaf3ef] text-[#164c3d]":"text-slate-500"}`}><Icon name="settings" className="size-[18px]"/>Settings</Link></div>
    </nav>
  </aside>;
}
