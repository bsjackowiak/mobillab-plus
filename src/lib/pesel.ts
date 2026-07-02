export function isValidPesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;

  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(pesel[i]) * weights[i]!;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(pesel[10]);
}

export function formatPeselInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatPeselDisplay(digits: string): string {
  const d = formatPeselInput(digits);
  const parts: string[] = [];
  if (d.length > 0) parts.push(d.slice(0, 2));
  if (d.length > 2) parts.push(d.slice(2, 5));
  if (d.length > 5) parts.push(d.slice(5, 7));
  if (d.length > 7) parts.push(d.slice(7, 11));
  return parts.join(" ");
}

export function parsePeselBirthDate(pesel: string): Date | null {
  if (pesel.length < 6) return null;

  const yy = Number(pesel.slice(0, 2));
  let mm = Number(pesel.slice(2, 4));
  const dd = Number(pesel.slice(4, 6));

  let century = 0;
  if (mm >= 1 && mm <= 12) century = 1900;
  else if (mm >= 21 && mm <= 32) {
    century = 2000;
    mm -= 20;
  } else if (mm >= 41 && mm <= 52) {
    century = 2100;
    mm -= 40;
  } else if (mm >= 61 && mm <= 72) {
    century = 2200;
    mm -= 60;
  } else if (mm >= 81 && mm <= 92) {
    century = 1800;
    mm -= 80;
  } else {
    return null;
  }

  const year = century + yy;
  const date = new Date(year, mm - 1, dd);
  if (date.getFullYear() !== year || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
    return null;
  }

  return date;
}

export function formatBirthDateLabel(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function maskPesel(pesel: string): string {
  if (pesel.length < 4) return pesel;
  return `${pesel.slice(0, 2)}******${pesel.slice(-3)}`;
}
