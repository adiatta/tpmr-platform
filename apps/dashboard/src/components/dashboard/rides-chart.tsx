"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Données de démonstration — à remplacer par un agrégat de GET /rides côté API.
const data = [
  { hour: "7h", courses: 8 },
  { hour: "8h", courses: 14 },
  { hour: "9h", courses: 6 },
  { hour: "12h", courses: 5 },
  { hour: "15h", courses: 4 },
  { hour: "16h", courses: 12 },
  { hour: "17h", courses: 9 },
  { hour: "18h", courses: 2 },
];

export function RidesPerHourChart() {
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
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid hsl(190 15% 88%)",
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="courses"
            stroke="hsl(183 60% 22%)"
            strokeWidth={2}
            fill="url(#ridesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
