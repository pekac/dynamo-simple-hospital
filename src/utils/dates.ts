export function truncateDateToDay(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0);
  return dayStart;
}

export function truncateDateToWeek(date: Date): Date {
  const currentDayOfWeek = date.getDay();
  const daysUntilLastMonday = (currentDayOfWeek - 1 + 7) % 7;
  const lastMonday = new Date(date);
  lastMonday.setDate(date.getDate() - daysUntilLastMonday);
  return truncateDateToDay(lastMonday);
}
