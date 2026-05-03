export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', '₹ ');
};

export const formatCompactNumber = (number: number) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
  return `₹ ${formatted}`;
};
