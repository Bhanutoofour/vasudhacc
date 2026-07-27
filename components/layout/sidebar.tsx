"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";

const primary: { label: string; href: string; icon: IconName }[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Inventory", href: "/inventory", icon: "inventory" },
];
const future: { label: string; icon: IconName }[] = [
  { label: "Orders", icon: "orders" }, { label: "Sales", icon: "sales" }, { label: "Customers", icon: "customers" },
  { label: "Marketing", icon: "marketing" }, { label: "Logistics", icon: "logistics" }, { label: "AI Insights", icon: "sparkles" },
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
      {future.map((item) => <div key={item.label} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400"><Icon name={item.icon} className="size-[18px]"/><span>{item.label}</span><span className="ml-auto rounded bg-slate-100 px-1.5 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">Soon</span></div>)}
      <div className="mt-auto border-t border-slate-100 pt-3"><div className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-500"><Icon name="settings" className="size-[18px]"/>Settings</div></div>
    </nav>
  </aside>;
}
