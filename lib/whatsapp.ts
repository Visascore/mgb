export function buildWhatsAppLink(number: string, message: string): string {
  const digitsOnly = number.replace(/[^0-9]/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppNumber = {
  id: string;
  label: string;
  number: string;
  isDefault: boolean;
};
