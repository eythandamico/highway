import type { BookingSlot } from './schedule-capacity.ts';

export type AvailabilityWindow = Pick<BookingSlot, 'date' | 'time' | 'end'>;
/** Presentation only: booking and matching must still use individual crew slots. */
export function availabilityWindows(slots: BookingSlot[]): AvailabilityWindow[] {
  const windows: AvailabilityWindow[] = [];
  for (const slot of [...slots].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))) {
    const last = windows.at(-1);
    if (last && last.date === slot.date && slot.time <= last.end) {
      if (slot.end > last.end) last.end = slot.end;
    } else {
      windows.push({ date: slot.date, time: slot.time, end: slot.end });
    }
  }
  return windows;
}
