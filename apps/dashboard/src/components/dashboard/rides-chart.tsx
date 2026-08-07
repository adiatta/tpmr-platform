"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Ride } from "@/lib/types";

function buildHourlyData(rides: Ride[]) {
  const counts = new Map<number, number>();
  for (const ride of rides) {
    const hour = new Date(ride.scheduled_at).getHours();
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  }
  const hours = [...counts.keys()].sort((a, b) => a - b);
  if (hours.length === 0) return [];
  const min = hours[0];
  const max = hours[hours.length - 1];
  const data = [];
  for (let h = min; h <= max; h++) {
    data.push({ hour: `${h}h`, courses: counts.get(h) ?? 0 });
  }
  return data;
}

export function RidesPerHourChart({ rides }: { rides: Ride[] }) {
  const data = buildHourlyData(rides);

  if (data.length === 0) {
    return <p className="flex h-64 items-center justify-center text-sm text-muted">Aucune course aujourd'hui.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ridesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(183 60% 22%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(183 60% 22%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(190 15% 88%)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(190 15% 88%)", fontSize: 13 }} />
          <Area type="monotone" dataKey="courses" stroke="hsl(183 60% 22%)" strokeWidth={2} fill="url(#ridesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
