"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

// Nombre de courses par jour — à remplacer par un agrégat de GET /api/v1/rides
const RIDES_PER_DAY: Record<number, number> = { 3: 4, 8: 6, 12: 5, 15: 8, 21: 3, 27: 7 };

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const total = daysInMonth(year, month);
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0

  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="focus-ring rounded-lg p-2 hover:bg-border/40"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-display text-base font-semibold capitalize">
          {cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="focus-ring rounded-lg p-2 hover:bg-border/40"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`flex h-16 flex-col items-center justify-start rounded-lg p-1.5 text-sm ${
              day ? "border border-border" : ""
            }`}
          >
            {day && (
              <>
                <span className="font-medium">{day}</span>
                {RIDES_PER_DAY[day] && (
                  <span className="mt-1 rounded-full bg-primary-soft px-1.5 text-[11px] font-medium text-primary">
                    {RIDES_PER_DAY[day]} courses
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
