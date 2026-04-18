/**
 * Format date to Indonesian locale
 */
export function formatDate(date: any): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date to Hijri calendar (Islamic calendar)
 */
export function formatHijriDate(date: any): string {
  if (!date) return '';
  const d = new Date(date);

  // Menggunakan Intl.DateTimeFormat dengan kalender islamic-umalqura
  return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
