import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

// Setup Day.js for Indonesian Locale & Plugins
dayjs.locale("id");
dayjs.extend(relativeTime);

/**
 * Format a date string into a standard, readable Indonesian format.
 * Example: "19 Mei 2026, 14:30"
 */
export const formatDateTime = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("D MMMM YYYY, HH:mm");
};

/**
 * Format a date string into just the date part.
 * Example: "19 Mei 2026"
 */
export const formatDate = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("D MMMM YYYY");
};

/**
 * Get relative time from now.
 * Example: "2 jam yang lalu", "dalam 3 hari"
 */
export const timeFromNow = (dateStr: string | Date | null | undefined): string => {
  if (!dateStr) return "-";
  return dayjs(dateStr).fromNow();
};

export default dayjs;
