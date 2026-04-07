import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import SellForm from './sell-form'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function VehicleSellPage({ params }: PageProps) {
  const { profile } = await getUserProfile()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select(
      'id, internal_vehicle_id, brand, model, vin, status, buyer_name, sale_price, sale_date, sale_payment_method, sale_vat_type, vat_type'
    )
    .eq('id', id)
    .single()

  if (error) {
    return (
      <main className="p-6">
        <p className="text-red-600">Fehler beim Laden: {error.message}</p>
      </main>
    )
  }

  if (!vehicle) {
    notFound()
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Verkauf verwalten</h1>
          <p className="mt-1 text-sm text-gray-600">
            {vehicle.internal_vehicle_id} · {vehicle.brand} {vehicle.model}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/dashboard/vehicles/${vehicle.id}`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Zurück zu Details
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">Fahrzeug</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="block text-sm font-medium">Interne Fahrzeug ID</span>
            <p className="mt-1 text-sm text-gray-700">{vehicle.internal_vehicle_id}</p>
          </div>

          <div>
            <span className="block text-sm font-medium">FIN</span>
            <p className="mt-1 text-sm text-gray-700">{vehicle.vin}</p>
          </div>

          <div>
            <span className="block text-sm font-medium">Marke</span>
            <p className="mt-1 text-sm text-gray-700">{vehicle.brand}</p>
          </div>

          <div>
            <span className="block text-sm font-medium">Model</span>
            <p className="mt-1 text-sm text-gray-700">{vehicle.model}</p>
          </div>
        </div>
      </section>

      <SellForm vehicle={vehicle} />
    </main>
  )
}