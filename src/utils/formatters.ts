export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function suggestCategoryFromNote(note: string): string | null {
  const lower = note.toLowerCase();
  if (/supermercato|spesa|conad|coop|esselunga|frutta|pane|latte|cibo|market/.test(lower)) {
    return 'Spesa Alimentare';
  }
  if (/luce|gas|enel|internet|fibra|affitto|condominio|utenze|bolletta/.test(lower)) {
    return 'Bollette & Casa';
  }
  if (/scuola|libro|cancelleria|quaderni|mensa|lezione|ripetizioni|corso/.test(lower)) {
    return 'Attività & Scuola';
  }
  if (/cinema|pizza|mcdonald|bar|aperitivo|giochi|playstation|steam|netflix|spotify|concerto|amici/.test(lower)) {
    return 'Svago & Uscite';
  }
  if (/benzina|treno|autobus|metro|abbonamento|pedaggio|scooter|bici/.test(lower)) {
    return 'Trasporti';
  }
  if (/farmacia|visita|dentista|medico|tachipirina|occhiali/.test(lower)) {
    return 'Salute & Benessere';
  }
  if (/scarpe|maglietta|vestiti|zara|h&m|abbigliamento/.test(lower)) {
    return 'Abbigliamento';
  }
  return null;
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => 
      row.map(field => {
        const str = String(field ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      }).join(';')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
