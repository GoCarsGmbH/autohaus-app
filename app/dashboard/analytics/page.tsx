import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/get-user-profile'

type SearchParams = Promise<{
  period?: string
  selected?: string
}>

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { profile } = await getUserProfile()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const period =
    params.period === 'quarter' || params.period === 'year'
      ? params.period
      : 'month'

  const selected = params.selected ?? null

  const supabase = await createClient()

  const { data: summaryRows, error: summaryError } = await supabase.rpc('sales_kpis', {
    p_period: period,
  })

  if (summaryError) {
    return (
      <main className="p-6">
        <p className="text-red-600">Fehler beim Laden der Auswertung: {summaryError.message}</p>
      </main>
    )
  }

  const selectedPeriod =
    selected ?? (summaryRows?.length ? summaryRows[0].period_label : null)

  let detailRows: any[] = []
  if (selectedPeriod) {
    const { data, error } = await supabase.rpc('sales_details_for_period', {
      p_period_type: period,
      p_period_label: selectedPeriod,
    })

    if (error) {
      return (
        <main className="p-6">
          <p className="text-red-600">Fehler beim Laden der Verkäufe: {error.message}</p>
        </main>
      )
    }

    detailRows = data ?? []
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Auswertung</h1>
          <p className="mt-1 text-sm text-gray-600">
            Umsatz und Gewinn nach Monat, Quartal oder Jahr
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Zurück zum Dashboard
        </Link>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard/analytics?period=month"
          className={`rounded-lg border px-4 py-2 text-sm ${period === 'month' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
          Monat
        </Link>
        <Link
          href="/dashboard/analytics?period=quarter"
          className={`rounded-lg border px-4 py-2 text-sm ${period === 'quarter' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
          Quartal
        </Link>
        <Link
          href="/dashboard/analytics?period=year"
          className={`rounded-lg border px-4 py-2 text-sm ${period === 'year' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
          Jahr
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Zeitraum</th>
              <th className="px-4 py-3 text-left">Verkäufe</th>
              <th className="px-4 py-3 text-left">Umsatz</th>
              <th className="px-4 py-3 text-left">Brutto Gewinn</th>
              <th className="px-4 py-3 text-left">Netto Gewinn</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows?.length ? (
              summaryRows.map((row: any) => {
                const isSelected = row.period_label === selectedPeriod

                return (
                  <tr
                    key={row.period_label}
                    className={`border-t ${isSelected ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/analytics?period=${period}&selected=${encodeURIComponent(row.period_label)}`}
                        className="text-blue-600 hover:underline"
                      >
                        {row.period_label}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{row.sold_count}</td>
                    <td className="px-4 py-3">{formatCurrency(row.revenue)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.gross_profit)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.net_profit)}</td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Noch keine Verkaufsdaten vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-medium">
            Einzelverkäufe {selectedPeriod ? `für ${selectedPeriod}` : ''}
          </h2>
          <p className="text-sm text-gray-600">
            Detailansicht des ausgewählten Zeitraums
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Fahrzeug_ID</th>
                <th className="px-4 py-3 text-left">Marke</th>
                <th className="px-4 py-3 text-left">Modell</th>
                <th className="px-4 py-3 text-left">Einkaufspreis</th>
                <th className="px-4 py-3 text-left">Verkaufspreis</th>
                <th className="px-4 py-3 text-left">Brutto Gewinn</th>
                <th className="px-4 py-3 text-left">Netto Gewinn</th>
              </tr>
            </thead>
            <tbody>
              {detailRows.length ? (
                detailRows.map((row: any) => (
                  <tr key={row.vehicle_id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span>{row.internal_vehicle_id}</span>
                        {row.image_document_id ? (
                          <img
                            src={`/api/documents/${row.image_document_id}/image`}
                            alt={`${row.brand} ${row.model}`}
                            className="h-10 w-14 rounded border object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.brand}</td>
                    <td className="px-4 py-3">{row.model}</td>
                    <td className="px-4 py-3">{formatCurrency(row.purchase_price)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.sale_price)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.gross_profit)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.net_profit)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    Keine Verkäufe für diesen Zeitraum vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}