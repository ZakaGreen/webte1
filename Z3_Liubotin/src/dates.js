// Format a server date in the user’s local time.
export function formatDate(value) {
  return new Date(value).toLocaleString('sk-SK', { dateStyle: 'medium', timeStyle: 'short' });
}

// datetime-local expects local time, without Z or a timezone offset.
export function toInputDate(value) {
  const date = new Date(value);
  // Add a leading zero to one-digit date and time parts.
  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// An unfinished task is overdue after its end time.
export function isOverdue(task) {
  return !task.is_finished && new Date(task.date_to) < new Date();
}
