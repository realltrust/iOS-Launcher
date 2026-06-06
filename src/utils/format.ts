export const formatTime = (date = new Date()) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

export const formatLongDate = (date = new Date()) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);

export const formatHour = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

export const formatShortHour = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
  }).format(new Date(iso));
