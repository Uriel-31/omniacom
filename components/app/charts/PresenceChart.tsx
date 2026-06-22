"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Point {
  jour: string;
  presents: number;
  absents: number;
}

export function PresenceChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="jour" tickLine={false} axisLine={false} tick={{ fill: "var(--color-faint)", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--color-faint)", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "var(--color-line-soft)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-line)",
              boxShadow: "var(--shadow-pop)",
              fontSize: 13,
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="presents" name="Présents" fill="var(--color-brand-500)" radius={[4, 4, 0, 0]} maxBarSize={26} />
          <Bar dataKey="absents" name="Absents" fill="var(--color-line)" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
