import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import ImageModal from '@/components/image-modal'

type SearchParams = Promise<{
  status?: string
}>

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const { profile } = await getUserProfile()
  const isAdmin = profile?.role === 'admin'

  const params = await searchParams
  const status =
    params.status === 'verfuegbar' ||
    params.status === 'reserviert' ||
    params.status === 'verkauft'
      ? params.status
      : 'alle'

  let query = supabase
    .from('vehicles_dashboard')
    .select('id, internal_vehicle_id, brand, model, vin, first_registration, purchase_price, hu_until, image_document_id, status')
    .order('created_at', { ascending: false })

  if (status !== 'alle') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
 

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        <p className="text-red-600">Fehler beim Laden: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-semibold">Fahrzeuge</h1>
    <p className="mt-1 text-sm text-gray-600">
      Rolle: {profile?.role ?? 'unbekannt'}
    </p>
  </div>

  <div className="flex items-center gap-3">
    {isAdmin ? (
      <Link
        href="/dashboard/vehicles/new"
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Neues Fahrzeug anlegen
      </Link>
    ) : null}

    {isAdmin ? (
        <Link
            href="/dashboard/analytics"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
            Auswertung
        </Link>
        ) : null}

    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Logout
      </button>
    </form>
  </div>
</div>
        <div className="mb-4 flex gap-3">
        <Link
            href="/dashboard"
            className={`rounded-lg border px-4 py-2 text-sm ${status === 'alle' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
            Alle
        </Link>
        <Link
            href="/dashboard?status=verfuegbar"
            className={`rounded-lg border px-4 py-2 text-sm ${status === 'verfuegbar' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
            Verfügbar
        </Link>
        <Link
            href="/dashboard?status=reserviert"
            className={`rounded-lg border px-4 py-2 text-sm ${status === 'reserviert' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
            Reserviert
        </Link>
        <Link
            href="/dashboard?status=verkauft"
            className={`rounded-lg border px-4 py-2 text-sm ${status === 'verkauft' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
            Verkauft
        </Link>
        </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Interne Fahrzeug ID</th>
              <th className="px-4 py-3 text-left">Marke</th>
              <th className="px-4 py-3 text-left">Model</th>
              <th className="px-4 py-3 text-left">FIN</th>
              <th className="px-4 py-3 text-left">Erstzulassung</th>
              <th className="px-4 py-3 text-left">Kaufpreis</th>
              <th className="px-4 py-3 text-left">HU-bis</th>
              <th className="px-4 py-3 text-left">Details</th>
              <th className="px-4 py-3 text-left">Verkauf</th>
            </tr>
          </thead>
          <tbody>
            {data?.length ? (
              data.map((vehicle) => (
                <tr key={vehicle.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <span>{vehicle.internal_vehicle_id}</span>

                        {vehicle.image_document_id ? (
                        <ImageModal
                            src={`/api/documents/${vehicle.image_document_id}/image`}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="h-10 w-14 rounded border object-cover"
                        />
                        ) : null}
                    </div>
                    </td>
                  <td className="px-4 py-3">{vehicle.brand}</td>
                  <td className="px-4 py-3">{vehicle.model}</td>
                  <td className="px-4 py-3">{vehicle.vin}</td>
                  <td className="px-4 py-3">{vehicle.first_registration ?? '—'}</td>
                  <td className="px-4 py-3">{vehicle.purchase_price ?? '—'}</td>
                  <td className="px-4 py-3">{vehicle.hu_until ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/vehicles/${vehicle.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                        <Link
                        href={`/dashboard/vehicles/${vehicle.id}/sell`}
                        className="text-blue-600 hover:underline"
                        >
                        Verkauf
                        </Link>
                    ) : (
                        '—'
                    )}
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                  Noch keine Fahrzeuge vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}