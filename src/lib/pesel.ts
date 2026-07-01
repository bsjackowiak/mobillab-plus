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

export function maskPesel(pesel: string): string {
  if (pesel.length < 4) return pesel;
  return `${pesel.slice(0, 2)}******${pesel.slice(-3)}`;
}
