// components/ad-slot.tsx
// مكوّنات مساحات إعلانية موحّدة الشكل، تُستخدم في كل صفحات الموقع
// (بحدود متقطعة مميزة بوضوح عن المحتوى الحقيقي، بانتظار ربطها بشبكة إعلانات فعلية لاحقاً)

export function AdBanner({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-white/10 bg-[#111118]/50 flex items-center justify-center text-gray-600 text-xs tracking-wide h-24 md:h-28 ${className}`}
    >
      {label}
    </div>
  )
}

export function AdCard({
  label,
  sublabel,
  className = '',
}: {
  label: string
  sublabel?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-white/10 bg-[#111118]/50 flex flex-col items-center justify-center gap-1 text-gray-600 ${className}`}
    >
      {sublabel && <span className="text-[9px] tracking-widest uppercase text-gray-700">{sublabel}</span>}
      <span className="text-xs">{label}</span>
    </div>
  )
}

// شريط إعلاني أفقي رفيع (مناسب لأعلى/أسفل الصفحة أو بين الأقسام)
export function AdStrip({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/10 bg-[#111118]/40 flex items-center justify-center text-gray-600 text-[11px] tracking-wide h-14 ${className}`}
    >
      {label}
    </div>
  )
}
