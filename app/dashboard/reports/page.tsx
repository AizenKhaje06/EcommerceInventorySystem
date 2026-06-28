"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/table-skeleton"
import { EnterpriseDateRangePicker } from "@/components/ui/enterprise-date-range-picker"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { apiGet } from "@/lib/api-client"
import { ChartTooltip } from "@/components/ui/chart-tooltip"
import { BarChart2 } from "lucide-react"
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, Package,
  BarChart3, AlertTriangle, XCircle, CheckCircle2, RotateCcw,
  Percent, ArrowUpRight, ArrowDownRight, FileBarChart2, RefreshCw,
  Layers, Activity, List
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Cell
} from "recharts"
import type { SalesReport, DashboardStats, InventoryItem, ABCAnalysis, InventoryTurnover } from "@/lib/types"

interface DepartmentsData {
  departments: {
    name: string; type: string
    revenue: number; cost: number; profit: number
    transactions: number; quantity: number
  }[]
  totals: { revenue: number; cost: number; profit: number; transactions: number; quantity: number }
}

const CHANNEL_COLORS: Record<string, string> = {
  Shopee: "#EE4D2D", Lazada: "#0F146D", Facebook: "#1877F2",
  TikTok: "#010101", "Physical Store": "#10B981", Unknown: "#94A3B8",
}

function StatCard({ title, value, icon: Icon, color, shadow, sub }: {
  title: string; value: string; icon: any
  color: string; shadow: string; sub?: string
}) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${color} shadow-lg ${shadow} flex-shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums truncate">{value}</p>
            {sub && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ title, icon: Icon, color }: { title: string; icon: any; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-slate-200 dark:border-slate-700">
      <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
    </div>
  )
}

export default function ReportsPage() {
  const now = new Date()
  const [startDate, setStartDate] = useState<Date | null>(new Date(now.getFullYear(), now.getMonth(), 1))
  const [endDate, setEndDate] = useState<Date | null>(new Date(now.getFullYear(), now.getMonth() + 1, 0))

  const [report, setReport] = useState<SalesReport | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [departments, setDepartments] = useState<DepartmentsData | null>(null)
  const [analytics, setAnalytics] = useState<{ abc: ABCAnalysis[]; turnover: InventoryTurnover[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { fetchAll() }, [startDate, endDate])

  async function fetchAll(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const sd = startDate?.toISOString() ?? ""
      const ed = endDate?.toISOString() ?? ""
      const qs = sd && ed ? `?startDate=${sd}&endDate=${ed}` : ""

      const deptParams = new URLSearchParams()
      if (sd) deptParams.append("startDate", sd)
      if (ed) deptParams.append("endDate",   ed)

      const [r, s, inv, dept, ana] = await Promise.all([
        apiGet<SalesReport>(`/api/reports${qs}`).catch(() => null),
        apiGet<DashboardStats>(`/api/dashboard${qs ? qs + "&period=ID" : "?period=ID"}`).catch(() => null),
        apiGet<InventoryItem[]>("/api/items").catch(() => []),
        apiGet<DepartmentsData>(`/api/departments?${deptParams}`).catch(() => null),
        apiGet<any>("/api/analytics?type=all").catch(() => null),
      ])

      setReport(r); setStats(s); setItems(inv)
      setDepartments(dept); setAnalytics(ana)
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto py-5 space-y-6" aria-live="polite" aria-busy="true">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <StatCardSkeleton count={6} />
        <StatCardSkeleton count={4} />
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          <CardSkeleton lines={6} /><CardSkeleton lines={6} />
        </div>
        <span className="sr-only">Loading report...</span>
      </div>
    )
  }

  // â”€â”€ Derived values â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalRevenue    = report?.totalRevenue    ?? 0
  const totalCost       = report?.totalCost       ?? 0
  const totalProfit     = report?.totalProfit     ?? 0
  const profitMargin    = report?.profitMargin    ?? 0
  const totalOrders     = report?.totalOrders     ?? 0
  const itemsSold       = report?.itemsSold       ?? 0
  const aov             = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const totalDelivered  = stats?.totalDelivered    ?? 0
  const totalReturns    = stats?.totalReturns      ?? 0
  const returnRate      = stats?.returnRate        ?? 0
  const cancelledTotal  = stats?.totalCancelledOrders ?? 0
  const cancelledPacking = stats?.cancelledPackingQueue ?? 0
  const cancelledTrack  = stats?.cancelledTrackOrders  ?? 0
  const cancellationRate = stats?.cancellationRate ?? 0
  const fulfilmentRate  = stats?.deliveredPercentage ?? 0
  const topCancelReasons = stats?.topCancellationReasons ?? []

  const totalInventoryProducts = items.length
  const lowStockItems   = items.filter(i => i.quantity > 0 && i.quantity <= i.reorderLevel)
  const outOfStockItems = items.filter(i => i.quantity === 0)
  const totalStockValue = items.reduce((s, i) => s + i.quantity * i.sellingPrice, 0)
  const totalCOGSValue  = items.reduce((s, i) => s + i.quantity * i.costPrice, 0)

  const topProducts     = (stats?.topProducts ?? []).slice(0, 10)
  const monthlySales    = report?.monthlySales ?? []
  const dailySalesData  = report?.dailySales ?? []

  const abcData         = analytics?.abc ?? []
  const turnoverData    = analytics?.turnover ?? []
  const returnsByItem   = (stats?.returnsByItem ?? []).slice(0, 5)
  const deadStock       = turnoverData.filter(t => t.status === "dead-stock")
  const fastMoving      = turnoverData.filter(t => t.status === "fast-moving")
  const slowMoving      = turnoverData.filter(t => t.status === "slow-moving")

  const abcA = abcData.filter(a => a.category === "A").length
  const abcB = abcData.filter(a => a.category === "B").length
  const abcC = abcData.filter(a => a.category === "C").length

  const depts = departments?.departments ?? []
  const tickColor = "#94a3b8"

  return (
    <div className="max-w-[1400px] mx-auto py-5 space-y-12">

      {/* Section */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">Comprehensive Report</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Full business overview â€” sales, inventory, orders & analytics
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <EnterpriseDateRangePicker
            startDate={startDate} endDate={endDate}
            onDateChange={(s, e) => { setStartDate(s); setEndDate(e) }}
          />
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Section */}
      <section>
        <SectionHeader title="Sales & Revenue" icon={DollarSign} color="bg-emerald-600" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
          <StatCard title="Total Revenue"   value={formatCurrency(totalRevenue)} icon={DollarSign}   color="bg-emerald-600" shadow="shadow-emerald-500/30" />
          <StatCard title="Gross Profit"    value={formatCurrency(totalProfit)}  icon={TrendingUp}   color="bg-purple-600"  shadow="shadow-purple-500/30" />
          <StatCard title="Total Cost"      value={formatCurrency(totalCost)}    icon={TrendingDown} color="bg-rose-600"    shadow="shadow-rose-500/30" />
          <StatCard title="Profit Margin"   value={`${profitMargin.toFixed(1)}%`} icon={Percent}     color="bg-amber-600"   shadow="shadow-amber-500/30" />
          <StatCard title="Items Sold"      value={formatNumber(itemsSold)}      icon={Package}      color="bg-blue-600"    shadow="shadow-blue-500/30" />
          <StatCard title="Avg Order Value" value={formatCurrency(aov)}          icon={BarChart3}    color="bg-indigo-600"  shadow="shadow-indigo-500/30" />
        </div>

        {/* Monthly Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlySales} margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={m => new Date(m + "-01").toLocaleDateString("en-US", { month: "short" })} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} width={50} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No monthly data</div>
              )}
            </CardContent>
          </Card>

          {/* Revenue by Channel */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Revenue by Sales Channel</CardTitle>
            </CardHeader>
            <CardContent>
              {depts.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={depts} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                    <XAxis type="number" tick={{ fill: tickColor, fontSize: 10 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={28}>
                      {depts.map((d, i) => (
                        <Cell key={i} fill={CHANNEL_COLORS[d.name] ?? "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No channel data</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Channel Breakdown Table */}
      {depts.length > 0 && (
        <Card className="border-0 shadow-md mt-4">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Channel</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Cost</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Profit</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Margin</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Orders</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Items Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {depts.map((d) => {
                    const margin = d.revenue > 0 ? (d.profit / d.revenue * 100) : 0
                    return (
                      <tr key={d.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHANNEL_COLORS[d.name] ?? "#6366f1" }} />
                            {d.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white tabular-nums">{formatCurrency(d.revenue)}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">{formatCurrency(d.cost)}</td>
                        <td className={`px-4 py-3 text-right font-semibold tabular-nums ${d.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>{formatCurrency(d.profit)}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">{margin.toFixed(1)}%</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">{formatNumber(d.transactions)}</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400 tabular-nums">{formatNumber(d.quantity)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}


        {/* Top Products / Top Categories / Returns by Channel */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mt-4">

          {/* Top Products */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full flex-shrink-0"></div>
                <h3 className="text-slate-900 dark:text-white text-sm font-bold tracking-tight">Top Products</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 ml-3">Units sold by product</p>
            </div>
            <CardContent className="pt-4 pb-2">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(160, Math.min(stats.topProducts.length, 5) * 52)}>
                    <BarChart data={stats.topProducts.slice(0, 5).map((p: any) => ({ ...p, name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name }))} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.07} horizontal={false} vertical={true} />
                      <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={100} tick={{ fill: '#64748b' }} />
                      <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Units Sold']} />} cursor={{ fill: 'rgba(16,185,129,0.06)' }} />
                      <Bar dataKey="sales" fill="#10B981" radius={[0, 6, 6, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {stats.topProducts.slice(0, 5).map((p: any, i: number) => (
                      <div key={p.name} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${i === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{p.name}</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">{p.sales}x</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No sales data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-purple-500 rounded-full flex-shrink-0"></div>
                <h3 className="text-slate-900 dark:text-white text-sm font-bold tracking-tight">Top Categories</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 ml-3">Units sold by category</p>
            </div>
            <CardContent className="pt-4 pb-2">
              {stats?.topCategories && stats.topCategories.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(160, Math.min(stats.topCategories.length, 5) * 52)}>
                    <BarChart data={stats.topCategories.slice(0, 5).map((c: any) => ({ ...c, name: c.name.length > 18 ? c.name.substring(0, 18) + '...' : c.name }))} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.07} horizontal={false} vertical={true} />
                      <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={100} tick={{ fill: '#64748b' }} />
                      <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Units Sold']} />} cursor={{ fill: 'rgba(168,85,247,0.06)' }} />
                      <Bar dataKey="sales" fill="#A855F7" radius={[0, 6, 6, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {stats.topCategories.slice(0, 5).map((c: any, i: number) => (
                      <div key={c.name} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${i === 0 ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{c.name}</span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">{c.sales}x</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No category data yet</p>
                </div>
              )}
            </CardContent>
          </Card>

        {/* Store Performance - Top 5 */}
        <Card className="overflow-hidden border-0 shadow-md mt-4">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-emerald-500 rounded-full flex-shrink-0"></div>
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Top 5 Store Performance</h3>
            </div>
            <p className="text-xs mt-0.5 ml-3 text-slate-600 dark:text-slate-400">Revenue by store / warehouse</p>
          </div>
          <CardContent className="pt-4 pb-2">
            {stats?.storePerformance && stats.storePerformance.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.storePerformance.slice(0, 5)} margin={{ top: 10, bottom: 55, left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.07} horizontal={true} vertical={false} />
                    <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} interval={0} tick={{ fill: '#64748b' }} angle={-35} textAnchor="end" height={60} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={54} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#94a3b8' }} />
                    <Tooltip content={<ChartTooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />} cursor={{ fill: 'rgba(16,185,129,0.06)' }} />
                    <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {stats.storePerformance.slice(0, 5).map((_: any, i: number) => (
                        <Cell key={i} fill={i === 0 ? '#059669' : '#10B981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {stats.storePerformance.slice(0, 5).map((d: any, i: number) => (
                    <div key={d.name} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${i === 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex-shrink-0">{formatCurrency(d.count)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No store data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Return Count by Channel */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-red-500 rounded-full flex-shrink-0"></div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Return Count by Sales Channel</h3>
              </div>
              <p className="text-xs mt-0.5 ml-3 text-slate-600 dark:text-slate-400">Returned orders per channel</p>
            </div>
            <CardContent className="pt-4 pb-2">
              {stats?.cancelledOrdersByChannel && Object.keys(stats.cancelledOrdersByChannel).length > 0 ? (
                (() => {
                  const returnData = Object.entries(stats.cancelledOrdersByChannel).map(([name, data]) => ({
                    name: name.length > 18 ? name.substring(0, 18) + '...' : name,
                    count: typeof data === 'object' ? (data as any).count : data
                  }))
                  return (
                    <>
                      <ResponsiveContainer width="100%" height={Math.max(160, Math.min(returnData.length, 5) * 52)}>
                        <BarChart data={returnData.slice(0, 5)} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.07} horizontal={false} vertical={true} />
                          <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                          <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={100} tick={{ fill: '#64748b' }} />
                          <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Returns']} />} cursor={{ fill: 'rgba(239,68,68,0.06)' }} />
                          <Bar dataKey="count" fill="#EF4444" radius={[0, 6, 6, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                        {returnData.slice(0, 5).map((r, i) => (
                          <div key={r.name} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${i === 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</span>
                              <span className="font-semibold text-slate-900 dark:text-white truncate">{r.name}</span>
                            </div>
                            <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0">{r.count} returns</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()
              ) : (
                <div className="text-center py-12">
                  <RotateCcw className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No returns yet</p>
                  <p className="text-xs text-slate-400 mt-1">Returned orders by channel will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Return Count by Item */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-orange-500 rounded-full flex-shrink-0"></div>
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Return Count by Item</h3>
              </div>
              <p className="text-xs mt-0.5 ml-3 text-slate-600 dark:text-slate-400">Top 5 most returned products</p>
            </div>
            <CardContent className="pt-4 pb-2">
              {returnsByItem.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={Math.max(160, returnsByItem.length * 52)}>
                    <BarChart data={returnsByItem} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.07} horizontal={false} vertical={true} />
                      <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                      <YAxis type="category" dataKey="name" fontSize={10} tickLine={false} axisLine={false} width={100} tick={{ fill: '#64748b' }}
                        tickFormatter={(v: string) => v.length > 16 ? v.substring(0, 16) + '...' : v} />
                      <Tooltip content={<ChartTooltip formatter={(value) => [value.toString(), 'Returns']} />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
                      <Bar dataKey="count" fill="#F97316" radius={[0, 6, 6, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    {returnsByItem.map((r: any, i: number) => (
                      <div key={r.name} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${i === 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-orange-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{i + 1}</span>
                          <span className="font-semibold text-slate-900 dark:text-white truncate">{r.name}</span>
                        </div>
                        <span className="font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">{r.count} returns</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <RotateCcw className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No returned items yet</p>
                  <p className="text-xs text-slate-400 mt-1">Items with RETURNED parcel status will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      {/* Section */}
      <section>
        <SectionHeader title="Orders Summary" icon={ShoppingCart} color="bg-blue-600" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
          <StatCard title="Total Orders"       value={formatNumber(totalOrders)}    icon={List}          color="bg-blue-600"    shadow="shadow-blue-500/30" />
          <StatCard title="Delivered"          value={formatNumber(totalDelivered)} icon={CheckCircle2}  color="bg-emerald-600" shadow="shadow-emerald-500/30" sub={`${fulfilmentRate.toFixed(1)}% fulfilment`} />
          <StatCard title="Returns"            value={formatNumber(totalReturns)}   icon={RotateCcw}     color="bg-amber-600"   shadow="shadow-amber-500/30"   sub={`${returnRate.toFixed(1)}% rate`} />
          <StatCard title="Cancelled (Total)"  value={formatNumber(cancelledTotal)} icon={XCircle}       color="bg-rose-600"    shadow="shadow-rose-500/30"    sub={`${cancellationRate.toFixed(1)}% rate`} />
          <StatCard title="Cancelled (Packing)" value={formatNumber(cancelledPacking)} icon={Package}   color="bg-orange-600"  shadow="shadow-orange-500/30" />
          <StatCard title="Cancelled (Tracked)" value={formatNumber(cancelledTrack)}  icon={Activity}   color="bg-pink-600"    shadow="shadow-pink-500/30" />
        </div>

        {/* Top Cancellation Reasons */}
        {topCancelReasons.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Top Cancellation Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topCancelReasons.slice(0, 8).map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700 dark:text-slate-300 truncate">{r.reason || "Not specified"}</span>
                    <Badge variant="secondary" className="tabular-nums flex-shrink-0">{r.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Section */}
      <section>
        <SectionHeader title="Inventory Snapshot" icon={Package} color="bg-purple-600" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <StatCard title="Total Products"   value={formatNumber(totalInventoryProducts)} icon={Package}       color="bg-purple-600"  shadow="shadow-purple-500/30" />
          <StatCard title="Total Stock Value" value={formatCurrency(totalStockValue)}     icon={DollarSign}    color="bg-indigo-600"  shadow="shadow-indigo-500/30" />
          <StatCard title="Total COGS Value" value={formatCurrency(totalCOGSValue)}       icon={TrendingDown}  color="bg-slate-600"   shadow="shadow-slate-500/30" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Low Stock Items ({lowStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold tabular-nums flex-shrink-0 ml-2">{item.quantity} left</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-400 py-4 text-center">No low stock items</p>}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Out of Stock ({outOfStockItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outOfStockItems.length > 0 ? (
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                  {outOfStockItems.map(item => (
                    <div key={item.id} className="flex justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex-shrink-0 ml-2">Out of stock</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-400 py-4 text-center">No out-of-stock items</p>}
            </CardContent>
          </Card>
        </div>

      </section>

      <section>
        <SectionHeader title="Analytics &amp; Insights" icon={BarChart3} color="bg-pink-600" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Fast Moving */}
          <Card className="border-0 shadow-md border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Fast Moving ({fastMoving.length})
              </CardTitle>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Sells in under 90 days</p>
            </CardHeader>
            <CardContent>
              {fastMoving.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {fastMoving.map((t, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{t.itemName}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 tabular-nums">{(t.daysToSell ?? 0).toFixed(0)}d</span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{(t.turnoverRatio ?? 0).toFixed(1)}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No fast-moving items</p>
              )}
            </CardContent>
          </Card>

          {/* Slow Moving */}
          <Card className="border-0 shadow-md border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Slow Moving ({slowMoving.length})
              </CardTitle>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">90 to 180 days to sell</p>
            </CardHeader>
            <CardContent>
              {slowMoving.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {slowMoving.map((t, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{t.itemName}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 tabular-nums">{(t.daysToSell ?? 0).toFixed(0)}d</span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">{(t.turnoverRatio ?? 0).toFixed(1)}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No slow-moving items</p>
              )}
            </CardContent>
          </Card>

          {/* Dead Stock */}
          <Card className="border-0 shadow-md border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Dead Stock ({deadStock.length})
              </CardTitle>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">180+ days with no sale</p>
            </CardHeader>
            <CardContent>
              {deadStock.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {deadStock.map((t, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{t.itemName}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 tabular-nums">{(t.daysToSell ?? 0).toFixed(0)}d</span>
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{(t.turnoverRatio ?? 0).toFixed(1)}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No dead stock items</p>
              )}
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Section */}
      <section>
        <SectionHeader title="Financial Overview" icon={TrendingUp} color="bg-indigo-600" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenue vs Profit bar */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Revenue vs Gross Profit vs Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Total Revenue", value: totalRevenue, color: "bg-emerald-500", max: totalRevenue },
                  { label: "Gross Profit",  value: totalProfit,  color: "bg-purple-500",  max: totalRevenue },
                  { label: "Total Cost",    value: totalCost,    color: "bg-rose-500",    max: totalRevenue },
                ].map(({ label, value, color, max }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: max > 0 ? `${Math.min((value / max) * 100, 100).toFixed(1)}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Revenue per Item</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {itemsSold > 0 ? formatCurrency(totalRevenue / itemsSold) : "₱0.00"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Profit per Order</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {totalOrders > 0 ? formatCurrency(totalProfit / totalOrders) : "₱0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gross Profit by Month */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Monthly Gross Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlySales.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlySales} margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={m => new Date(m + "-01").toLocaleDateString("en-US", { month: "short" })} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} width={50} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Gross Profit"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="profit" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: "#8b5cf6" }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No monthly data</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

    </div>
  )
}


