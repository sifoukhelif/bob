// app/api/orders/[id]/invoice/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

type Params = Promise<{ id: string }>

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, alignItems: 'flex-start' },
  brand: { fontSize: 20, fontWeight: 700, color: '#0a0a12' },
  brandSub: { fontSize: 9, color: '#888', marginTop: 2 },
  invoiceTitle: { fontSize: 16, fontWeight: 700, textAlign: 'right' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  metaLabel: { color: '#888' },
  section: { marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f4f4f4', padding: 8, fontWeight: 700 },
  tableRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  colItem: { flex: 3 }, colPrice: { flex: 1, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#0a0a12' },
  totalLabel: { fontSize: 13, fontWeight: 700, marginRight: 12 },
  totalValue: { fontSize: 13, fontWeight: 700 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#aaa', textAlign: 'center' },
})

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: order } = await supabase
    .from('orders')
    .select(`id,total_amount,currency,status,created_at,stripe_session_id,
      order_items(unit_price,listings(title,stores(name)))`)
    .eq('id', id)
    .eq('buyer_id', user.id) // يضمن أن المشتري لا يستطيع تحميل فاتورة طلب غيره
    .maybeSingle()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = (order.order_items as any[]) ?? []
  const orderDate = new Date(order.created_at).toLocaleDateString('en-GB')
  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`

  const doc = React.createElement(Document, {},
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(View, { style: styles.header },
        React.createElement(View, {},
          React.createElement(Text, { style: styles.brand }, 'DEGITALE'),
          React.createElement(Text, { style: styles.brandSub }, 'Digital Products Marketplace'),
        ),
        React.createElement(View, {},
          React.createElement(Text, { style: styles.invoiceTitle }, 'INVOICE'),
        ),
      ),
      React.createElement(View, { style: styles.metaRow },
        React.createElement(Text, { style: styles.metaLabel }, 'Invoice Number'),
        React.createElement(Text, {}, invoiceNumber),
      ),
      React.createElement(View, { style: styles.metaRow },
        React.createElement(Text, { style: styles.metaLabel }, 'Date'),
        React.createElement(Text, {}, orderDate),
      ),
      React.createElement(View, { style: styles.metaRow },
        React.createElement(Text, { style: styles.metaLabel }, 'Status'),
        React.createElement(Text, {}, order.status),
      ),
      React.createElement(View, { style: styles.metaRow },
        React.createElement(Text, { style: styles.metaLabel }, 'Billed To'),
        React.createElement(Text, {}, user.email ?? ''),
      ),

      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Items'),
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: styles.colItem }, 'Product'),
          React.createElement(Text, { style: styles.colPrice }, 'Price'),
        ),
        ...items.map((item: any, i: number) =>
          React.createElement(View, { key: i, style: styles.tableRow },
            React.createElement(Text, { style: styles.colItem },
              `${item.listings?.title ?? 'Product'} (${item.listings?.stores?.name ?? ''})`),
            React.createElement(Text, { style: styles.colPrice }, `$${item.unit_price?.toFixed(2)}`),
          )
        ),
      ),

      React.createElement(View, { style: styles.totalRow },
        React.createElement(Text, { style: styles.totalLabel }, 'Total'),
        React.createElement(Text, { style: styles.totalValue }, `$${order.total_amount?.toFixed(2)} ${(order.currency ?? 'USD').toUpperCase()}`),
      ),

      React.createElement(Text, { style: styles.footer },
        `DEGITALE — ${invoiceNumber} — Generated on ${new Date().toLocaleDateString('en-GB')}`),
    )
  )

  const buffer = await renderToBuffer(doc as any)
  const body = new Uint8Array(buffer)

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
    },
  })
}
