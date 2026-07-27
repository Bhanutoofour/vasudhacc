import type { InventoryStatus } from "@/types/inventory";
const labels: Record<InventoryStatus, string> = { "in-stock": "In stock", "low-stock": "Low stock", "out-of-stock": "Out of stock", "stock-increased": "Stock increased", "stock-reduced": "Stock reduced" };
const styles: Record<InventoryStatus, string> = { "in-stock": "bg-slate-100 text-slate-600", "low-stock": "bg-amber-50 text-amber-700", "out-of-stock": "bg-red-50 text-red-600", "stock-increased": "bg-emerald-50 text-emerald-700", "stock-reduced": "bg-rose-50 text-rose-600" };
export function StatusBadge({ status }: { status: InventoryStatus }) { return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}>{labels[status]}</span>; }
