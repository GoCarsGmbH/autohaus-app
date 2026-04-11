import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from './actions'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import ImageModal from '@/components/image-modal'
import SearchBar from './search-bar'
import SortBar from './sort-bar'

type SearchParams = Promise<{
  status?: string
  query?: string
  sort?: string
  dir?: string
}>

function dashboardHref(
  nextStatus: string,
  currentQuery: string,
  currentSort: string,
  currentDir: string
) {
  const params = new URLSearchParams()

  if (nextStatus !== 'alle') {
    params.set('status', nextStatus)
  }

  if (currentQuery) {
    params.set('query', currentQuery)
  }

  if (currentSort && currentSort !== 'created_at') {
    params.set('sort', currentSort)
  } else if (currentSort === 'created_at') {
    params.set('sort', currentSort)
  }

  if (currentDir) {
    params.set('dir', currentDir)
  }

  const qs = params.toString()
  return qs ? `/dashboard?${qs}` : '/dashboard'
}

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

  const queryText =
    typeof params.query === 'string' ? params.query.trim() : '' 

const sort =
  params.sort === 'brand_model' ||
  params.sort === 'first_registration' ||
  params.sort === 'created_at'
    ? params.sort
    : 'created_at'

const dir = params.dir === 'asc' ? 'asc' : 'desc'
const ascending = dir === 'asc'

let vehiclesQuery = supabase
  .from('vehicles_dashboard')
  .select(
    'id, internal_vehicle_id, brand, model, vin, first_registration, purchase_price, hu_until, mileage_km, image_document_id, status, created_at'
  )

if (status !== 'alle') {
  vehiclesQuery = vehiclesQuery.eq('status', status)
}

if (queryText) {
  const escaped = queryText.replace(/[%_]/g, '')
  vehiclesQuery = vehiclesQuery.or(
    [
      `internal_vehicle_id.ilike.%${escaped}%`,
      `brand.ilike.%${escaped}%`,
      `model.ilike.%${escaped}%`,
      `vin.ilike.%${escaped}%`,
    ].join(',')
  )
}

if (sort === 'brand_model') {
  vehiclesQuery = vehiclesQuery
    .order('brand', { ascending })
    .order('model', { ascending })
} else if (sort === 'first_registration') {
  vehiclesQuery = vehiclesQuery.order('first_registration', { ascending })
} else {
  vehiclesQuery = vehiclesQuery.order('created_at', { ascending })
}

const { data, error } = await vehiclesQuery

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
       <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
  <SearchBar />
  <SortBar />
</div>

        {queryText ? (
  <p className="mb-4 text-sm text-gray-600">
    Suche: <span className="font-medium">{queryText}</span>
  </p>
) : null}



      <div className="mb-4 flex gap-3">
            <Link
              href={dashboardHref('alle', queryText, sort, dir)}
              className={`rounded-lg border px-4 py-2 text-sm ${status === 'alle' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
            >
              Alle
            </Link>
            <Link
              href={dashboardHref('verfuegbar', queryText, sort, dir)}
              className={`rounded-lg border px-4 py-2 text-sm ${status === 'verfuegbar' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
            >
              Verfügbar
            </Link>
            <Link
              href={dashboardHref('reserviert', queryText, sort, dir)}
              className={`rounded-lg border px-4 py-2 text-sm ${status === 'reserviert' ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
            >
              Reserviert
            </Link>
            <Link
              href={dashboardHref('verkauft', queryText, sort, dir)}
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
              <th className="px-4 py-3 text-left">Kilometerstand</th>
              { isAdmin ? (
              <th className="px-4 py-3 text-left">Kaufpreis</th>
              ) : null }
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
                  <td className="px-4 py-3">{vehicle.mileage_km ?? '—'}</td>
                  { isAdmin ? (
                  <td className="px-4 py-3">{vehicle.purchase_price ?? '—'}</td>
                  ) : null }
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