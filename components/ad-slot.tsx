// components/ad-slot.tsx
// مكوّنات مساحات إعلانية موحّدة الشكل، تُستخدم في كل صفحات الموقع
// (بحدود متقطعة مميزة بوضوح عن المحتوى الحقيقي، بانتظار ربطها بشبكة إعلانات فعلية لاحقاً)

export function AdBanner({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-white/10 bg-[#111118]/50 flex items-center justify-center text-gray-600 text-sm tracking-wide h-40 md:h-56 ${className}`}
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
      className={`rounded-2xl border border-dashed border-white/10 bg-[#111118]/50 flex flex-col items-center justify-center gap-1.5 text-gray-600 min-h-[220px] ${className}`}
    >
      {sublabel && <span className="text-[10px] tracking-widest uppercase text-gray-700">{sublabel}</span>}
      <span className="text-sm">{label}</span>
    </div>
  )
}

// شريط إعلاني أفقي (مناسب لأعلى/أسفل الصفحة أو بين الأقسام)
export function AdStrip({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/10 bg-[#111118]/40 flex items-center justify-center text-gray-600 text-sm tracking-wide h-28 md:h-32 ${className}`}
    >
      {label}
    </div>
  )
}
