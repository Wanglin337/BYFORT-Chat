export const BANK_OPTIONS = [
  { value: 'BCA', label: 'BCA' },
  { value: 'BRI', label: 'BRI' },
  { value: 'BNI', label: 'BNI' }, 
  { value: 'Mandiri', label: 'Mandiri' },
  { value: 'CIMB', label: 'CIMB Niaga' },
  { value: 'Danamon', label: 'Danamon' },
  { value: 'Permata', label: 'Permata' },
  { value: 'BTN', label: 'BTN' },
  { value: 'BSI', label: 'BSI' },
  { value: 'OVO', label: 'OVO' },
  { value: 'GoPay', label: 'GoPay' },
  { value: 'DANA', label: 'DANA' },
  { value: 'ShopeePay', label: 'ShopeePay' },
  { value: 'LinkAja', label: 'LinkAja' },
];

export const TRANSACTION_TYPES = {
  TOPUP: 'topup',
  WITHDRAW: 'withdraw', 
  SEND: 'send',
  RECEIVE: 'receive',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const FEES = {
  ADMIN_FEE: 1200,
  MIN_TOPUP: 12000,
  MAX_TOPUP: 10000000,
  MIN_WITHDRAW: 55000,
  MAX_WITHDRAW: 10000000,
  MIN_SEND: 10000,
  MAX_SEND: 10000000,
} as const;

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPhone = (phone: string): string => {
  if (phone.startsWith('+62')) {
    return phone;
  }
  return `+62${phone}`;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
