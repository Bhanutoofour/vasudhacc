import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f5f7f6]"><div className="flex"><Sidebar/><div className="min-w-0 flex-1"><Header/><main className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</main></div></div></div>;
}
