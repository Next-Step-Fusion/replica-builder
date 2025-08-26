export function formatNumber(number: number | undefined | null, maximumFractionDigits = 5) {
  if (number == null) return '';
  return number.toLocaleString(undefined, { maximumFractionDigits });
}
