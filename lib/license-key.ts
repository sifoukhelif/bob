// lib/license-key.ts
// يولّد مفتاح ترخيص فريد بصيغة DEGT-XXXX-XXXX-XXXX-XXXX
// عشوائي بالكامل (crypto)، غير قابل للتخمين، يُستخدم لمنتجات تحتاج ترخيصاً بدل/بجانب رابط تحميل
import { randomBytes } from 'crypto'

export function generateLicenseKey(): string {
  const segment = () => randomBytes(3).toString('hex').toUpperCase() // 6 hex chars per segment
  return `DEGT-${segment()}-${segment()}-${segment()}`
}
