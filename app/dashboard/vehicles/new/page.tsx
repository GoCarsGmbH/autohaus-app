import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createVehicle } from '../actions'
import { getUserProfile } from '@/lib/auth/get-user-profile'

export default async function NewVehiclePage() {
  const { profile } = await getUserProfile()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Neues Fahrzeug anlegen</h1>
          <p className="mt-1 text-sm text-gray-600">
            Stammdaten, technische Daten und Einkaufsdaten erfassen.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Zurück zum Dashboard
        </Link>

        
      </div>

      

      <form action={createVehicle} className="space-y-8">
        <section className="rounded-2xl border p-5">
          <h2 className="mb-4 text-lg font-medium">Stammdaten</h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label htmlFor="vin" className="mb-1 block text-sm font-medium">
                FIN *
              </label>
              <input
                id="vin"
                name="vin"
                required
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
                defaultValue=""
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
                defaultValue=""
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
            Fahrzeug speichern
          </button>

          <Link
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </main>
  )
}