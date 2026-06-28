// components/logo.tsx
import Image from 'next/image'

const SIZES = { sm: 32, md: 40 } as const

export function Logo({ size = 'md', className }: { size?: keyof typeof SIZES; className?: string }) {
  const px = SIZES[size]
  return (
    <Image
      src="/logo.png"
      alt="DEGITALE"
      width={px}
      height={px}
      priority
      className={className ?? 'rounded-xl shadow-[0_0_20px_rgba(201,168,76,0.25)]'}
    />
  )
}
