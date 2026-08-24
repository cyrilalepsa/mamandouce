export function buildReminderPayload({ title, date, time = '09:00', type = 'rdv' } = {}) {
  const cleanTitle = String(title || '').trim();
  const cleanDate = String(date || '').trim();
  const cleanTime = String(time || '09:00').trim();
  if (!cleanTitle || !/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    throw new Error('Titre et date requis');
  }
  const localDate = new Date(`${cleanDate}T${cleanTime}:00`);
  if (Number.isNaN(localDate.getTime())) {
    throw new Error('Date de rappel invalide');
  }
  return {
    title: cleanTitle,
    datetime: localDate.toISOString(),
    type: String(type || 'rdv'),
    reminder_type: 'push',
  };
}

export function normalizeReminder(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id ?? raw._id;
  const datetime = raw.datetime ?? raw.reminder_datetime;
  if (!id || !datetime || Number.isNaN(new Date(datetime).getTime())) return null;
  return {
    id: String(id),
    title: String(raw.title || raw.appointment_title || 'Rappel'),
    datetime: new Date(datetime).toISOString(),
    type: String(raw.type || 'rdv'),
    reminder_type: String(raw.reminder_type || 'push'),
    sent: Boolean(raw.sent),
  };
}

export function normalizeRemindersResponse(payload) {
  const body = payload?.data ?? payload ?? {};
  const raw = Array.isArray(body) ? body : body?.reminders;
  return Array.isArray(raw) ? raw.map(normalizeReminder).filter(Boolean) : [];
}

export function formatReminderDate(value, locale = 'fr-FR') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date indisponible';
  return date.toLocaleString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
