/**
 * Update the weekday of a date while preserving time.
 * Moves forward/backward to the target weekday (0=Sun, 6=Sat).
 * (Extracted from components/native-datetime-picker.tsx)
 */
export function updateWeekday(date: Date, weekday: number): Date {
  const updated = new Date(date)
  const currentDay = updated.getDay()
  const diff = weekday - currentDay
  updated.setDate(updated.getDate() + diff)
  return updated
}
