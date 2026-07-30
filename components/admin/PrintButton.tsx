'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-gold !py-2.5 !px-5 text-sm print:hidden"
    >
      Print / Save as PDF
    </button>
  );
}
