export function formatCurrency(from: number, to?: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (to && to !== from) {
    return `${formatter.format(from)} - ${formatter.format(to)}`;
  }
  
  return formatter.format(from);
}