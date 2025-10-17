import React from "react";

interface AvailableSlotsProps {
  selectedDate: string;
  tableId: string;
  existingReservations: Array<{ start_time: string; end_time: string }>;
}

export default function AvailableSlots({
  selectedDate,
  tableId,
  existingReservations,
}: AvailableSlotsProps) {
  if (!selectedDate) return null;

  // Générer les créneaux disponibles pour la journée
  const generateSlots = () => {
    const slots = [];
    const date = new Date(selectedDate);
    date.setHours(8, 0, 0, 0); // Commencer à 8h

    // Générer des créneaux de 30 minutes jusqu'à 22h
    while (date.getHours() < 22) {
      const slotStart = new Date(date);
      const slotEnd = new Date(date.getTime() + 30 * 60000); // +30 minutes

      // Vérifier si le créneau est disponible
      const isAvailable = !existingReservations.some((reservation) => {
        const resStart = new Date(reservation.start_time);
        const resEnd = new Date(reservation.end_time);
        return (
          (slotStart >= resStart && slotStart < resEnd) ||
          (slotEnd > resStart && slotEnd <= resEnd) ||
          (slotStart <= resStart && slotEnd >= resEnd)
        );
      });

      slots.push({
        start: new Date(slotStart),
        end: new Date(slotEnd),
        available: isAvailable,
      });

      date.setMinutes(date.getMinutes() + 30);
    }

    return slots;
  };

  const slots = generateSlots();
  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="bg-slate-800/30 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">
          📅 Créneaux disponibles
        </h3>
        <span className="text-xs text-slate-400">
          {availableCount} créneaux libres
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`text-xs py-2 px-2 rounded text-center transition-all ${
              slot.available
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30 opacity-50"
            }`}
            title={
              slot.available
                ? "Disponible"
                : "Occupé"
            }
          >
            {slot.start.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
          <span className="text-slate-400">Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
          <span className="text-slate-400">Occupé</span>
        </div>
      </div>
    </div>
  );
}

