import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateVehicle } from '@/app/dashboard/vehicles/actions'
import { getUserProfile } from '@/lib/auth/get-user-profile'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDateForInput(value: string | null) {
  if (!value) return ''
  return value.slice(0, 10)
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { profile } = await getUserProfile()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
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
          <h1 className="text-2xl font-semibold">Fahrzeug bearbeiten</h1>
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

      <form action={updateVehicle} className="space-y-8">
        <input type="hidden" name="vehicle_id" value={vehicle.id} />

        <section className="rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-medium">Stammdaten</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Interne Fahrzeug ID
              </label>
              <input
                value={vehicle.internal_vehicle_id}
                disabled
                className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="vin" className="mb-1 block text-sm font-medium">
                FIN *
              </label>
              <input
                id="vin"
                name="vin"
                required
                defaultValue={vehicle.vin ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="brand" className="mb-1 block text-sm font-medium">
                Marke *
              </label>
              <input
                id="brand"
                name="brand"
                required
                defaultValue={vehicle.brand ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="model" className="mb-1 block text-sm font-medium">
                Model *
              </label>
              <input
                id="model"
                name="model"
                required
                defaultValue={vehicle.model ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="color" className="mb-1 block text-sm font-medium">
                Farbe
              </label>
              <input
                id="color"
                name="color"
                defaultValue={vehicle.color ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="first_registration" className="mb-1 block text-sm font-medium">
                Erstzulassung
              </label>
              <input
                id="first_registration"
                name="first_registration"
                type="date"
                defaultValue={formatDateForInput(vehicle.first_registration)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>



            <div>
              <label htmlFor="hu_until" className="mb-1 block text-sm font-medium">
                HU-bis
              </label>
              <input
                id="hu_until"
                name="hu_until"
                type="date"
                defaultValue={formatDateForInput(vehicle.hu_until)}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

                        <div>
              <label htmlFor="mileage_km" className="mb-1 block text-sm font-medium">
                Kilometerstand
              </label>
              <input
                id="mileage_km"
                name="mileage_km"
                type="number"
                defaultValue={vehicle.mileage_km ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-medium">Technische Daten</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="engine_ccm" className="mb-1 block text-sm font-medium">
                Hubraum (cm³)
              </label>
              <input
                id="engine_ccm"
                name="engine_ccm"
                type="number"
                defaultValue={vehicle.engine_ccm ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="power_kw" className="mb-1 block text-sm font-medium">
                Leistung (kW)
              </label>
              <input
                id="power_kw"
                name="power_kw"
                type="number"
                defaultValue={vehicle.power_kw ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="kerb_weight_kg" className="mb-1 block text-sm font-medium">
                Leergewicht (kg)
              </label>
              <input
                id="kerb_weight_kg"
                name="kerb_weight_kg"
                type="number"
                defaultValue={vehicle.kerb_weight_kg ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="gross_weight_kg" className="mb-1 block text-sm font-medium">
                Zulässiges Gesamtgewicht (kg)
              </label>
              <input
                id="gross_weight_kg"
                name="gross_weight_kg"
                type="number"
                defaultValue={vehicle.gross_weight_kg ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="axle_load_1_kg" className="mb-1 block text-sm font-medium">
                Achslast 1 (kg)
              </label>
              <input
                id="axle_load_1_kg"
                name="axle_load_1_kg"
                type="number"
                defaultValue={vehicle.axle_load_1_kg ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="axle_load_2_kg" className="mb-1 block text-sm font-medium">
                Achslast 2 (kg)
              </label>
              <input
                id="axle_load_2_kg"
                name="axle_load_2_kg"
                type="number"
                defaultValue={vehicle.axle_load_2_kg ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="axle_load_3_kg" className="mb-1 block text-sm font-medium">
                Achslast 3 (kg)
              </label>
              <input
                id="axle_load_3_kg"
                name="axle_load_3_kg"
                type="number"
                defaultValue={vehicle.axle_load_3_kg ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="axle_load_4_kg" className="mb-1 block text-sm font-medium">
                Achslast 4 (kg)
              </label>
              <input
                id="axle_load_4_kg"
                name="axle_load_4_kg"
                type="number"
                defaultValue={vehicle.axle_load_4_kg ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="previous_owners" className="mb-1 block text-sm font-medium">
                Vorbesitzer
              </label>
              <input
                id="previous_owners"
                name="previous_owners"
                type="number"
                defaultValue={vehicle.previous_owners ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-medium">Einkauf</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="purchase_price" className="mb-1 block text-sm font-medium">
                Kaufpreis
              </label>
              <input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                defaultValue={vehicle.purchase_price ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>


            <div>
              <label htmlFor="vat_type" className="mb-1 block text-sm font-medium">
                USt-Status
              </label>
              <select
                id="vat_type"
                name="vat_type"
                defaultValue={vehicle.vat_type ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Bitte wählen</option>
                <option value="mit_ust">mit USt</option>
                <option value="ohne_ust">ohne USt</option>
              </select>
            </div>

            <div>
              <label htmlFor="purchase_payment_method" className="mb-1 block text-sm font-medium">
                Zahlungsart Einkauf
              </label>
              <select
                id="purchase_payment_method"
                name="purchase_payment_method"
                defaultValue={vehicle.purchase_payment_method ?? ''}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="">Bitte wählen</option>
                <option value="bar">Bar</option>
                <option value="karte_ueberweisung">Karte / Überweisung</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Änderungen speichern
          </button>

          <Link
            href={`/dashboard/vehicles/${vehicle.id}`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </main>
  )
}