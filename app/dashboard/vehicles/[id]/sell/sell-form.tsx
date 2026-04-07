'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { saveVehicleSale, type SaleFormState } from '@/app/dashboard/vehicles/actions'

type SellFormProps = {
  vehicle: {
    id: string
    status: string | null
    buyer_name: string | null
    sale_price: number | null
    sale_date: string | null
    sale_payment_method: string | null
    sale_vat_type: string | null
    vat_type: string | null
  }
}

function formatDateForInput(value: string | null) {
  if (value) return value.slice(0, 10)

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function SellForm({ vehicle }: SellFormProps) {
  const initialState: SaleFormState = {}
  const [state, formAction, isPending] = useActionState(saveVehicleSale, initialState)

  const canUseDifferenzbesteuerung = vehicle.vat_type === 'ohne_ust'

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="vehicle_id" value={vehicle.id} />

      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">Verkaufsdaten</h2>

        {state.message ? (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="buyer_name" className="mb-1 block text-sm font-medium">
              Käufer *
            </label>
            <input
              id="buyer_name"
              name="buyer_name"
              required
              defaultValue={vehicle.buyer_name ?? ''}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="sale_price" className="mb-1 block text-sm font-medium">
              Verkaufspreis
            </label>
            <input
              id="sale_price"
              name="sale_price"
              type="number"
              step="0.01"
              defaultValue={vehicle.sale_price ?? ''}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="sale_payment_method" className="mb-1 block text-sm font-medium">
              Zahlungsart Verkauf *
            </label>
            <select
              id="sale_payment_method"
              name="sale_payment_method"
              required
              defaultValue={vehicle.sale_payment_method ?? ''}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Bitte wählen</option>
              <option value="bar">Bar</option>
              <option value="karte_ueberweisung">Karte / Überweisung</option>
            </select>
          </div>

          <div>
            <label htmlFor="sale_vat_type" className="mb-1 block text-sm font-medium">
              Verkaufsart *
            </label>
            <select
              id="sale_vat_type"
              name="sale_vat_type"
              required
              defaultValue={vehicle.sale_vat_type ?? ''}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Bitte wählen</option>
              <option value="mit_ust">mit USt</option>
              <option value="ohne_ust">ohne USt</option>
              {canUseDifferenzbesteuerung ? (
                <option value="differenzbesteuerung">
                  Differenzbesteuerung (§ 25a UStG)
                </option>
              ) : null}
            </select>

            {!canUseDifferenzbesteuerung ? (
              <p className="mt-1 text-xs text-gray-500">
                Differenzbesteuerung ist nur möglich, wenn der Einkauf ohne USt erfolgt ist.
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="sale_date" className="mb-1 block text-sm font-medium">
              Verkaufsdatum
            </label>
            <input
              id="sale_date"
              name="sale_date"
              type="date"
              defaultValue={formatDateForInput(vehicle.sale_date)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={vehicle.status ?? 'verkauft'}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="verfuegbar">Verfügbar</option>
              <option value="reserviert">Reserviert</option>
              <option value="verkauft">Verkauft</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? 'Speichert...' : 'Verkauf speichern'}
        </button>

        <Link
          href="/dashboard"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Abbrechen
        </Link>
      </div>
    </form>
  )
}