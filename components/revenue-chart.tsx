// components/revenue-chart.tsx
'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

type Point = { date: string; amount: number }

export function RevenueChart({ data, currencySymbol = '$' }: { data: Point[]; currencySymbol?: string }) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="w-full h-56" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={36}
            tickFormatter={(v) => `${currencySymbol}${v}`} />
          <Tooltip
            contentStyle={{ background: '#15151D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, '']}
          />
          <Line type="monotone" dataKey="amount" stroke="#C9A84C" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
