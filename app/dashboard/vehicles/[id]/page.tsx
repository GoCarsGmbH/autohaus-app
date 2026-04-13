import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {deleteVehicleDocument} from '@/app/dashboard/vehicles/actions'
import {uploadVehicleDocument,} from '@/app/dashboard/vehicles/actions'
import { getUserProfile } from '@/lib/auth/get-user-profile'
import ImageModal from '@/components/image-modal'

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('de-DE').format(new Date(value))
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function displayValue(value: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'
  return value
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { profile } = await getUserProfile()
  const isAdmin = profile?.role === 'admin'

  const [{ data: vehicle, error: vehicleError }, { data: documents, error: documentsError }] =
    await Promise.all([
      supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', id)
        .order('created_at', { ascending: false }),
    ])

    const vehicleImage =
        documents?.find((doc) => doc.document_type === 'fahrzeugbild') ?? null

  if (vehicleError) {
    return (
      <main className="p-6">
        <p className="text-red-600">Fehler beim Laden: {vehicleError.message}</p>
      </main>
    )
  }

  if (!vehicle) {
    notFound()
  }

  if (documentsError) {
    return (
      <main className="p-6">
        <p className="text-red-600">Fehler beim Laden der Dokumente: {documentsError.message}</p>
      </main>
    )
  }

  return (
    <main className="p-6 space-y-6">
       <div className="flex items-start justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold">
            Fahrzeug {vehicle.internal_vehicle_id}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
            {vehicle.brand} {vehicle.model}
            </p>
        </div>

        {vehicleImage ? (
            <ImageModal
            src={`/api/documents/${vehicleImage.id}/image`}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="h-16 w-24 rounded-lg border object-cover"
            />
        ) : null}
        </div>

        <div className="flex gap-3">
        <Link
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
            Zurück
        </Link>

        {isAdmin ? (
            <Link
            href={`/dashboard/vehicles/${vehicle.id}/edit`}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
            >
            Bearbeiten
            </Link>
        ) : null}

        {isAdmin ? (
            <Link
            href={`/dashboard/vehicles/${vehicle.id}/sell`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
            Verkauf
            </Link>
        ) : null}
        </div>
    

      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">Stammdaten</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><span className="font-medium">Interne Fahrzeug ID:</span> {displayValue(vehicle.internal_vehicle_id)}</div>
          <div><span className="font-medium">FIN:</span> {displayValue(vehicle.vin)}</div>
          <div><span className="font-medium">Marke:</span> {displayValue(vehicle.brand)}</div>
          <div><span className="font-medium">Model:</span> {displayValue(vehicle.model)}</div>
          <div><span className="font-medium">Farbe:</span> {displayValue(vehicle.color)}</div>
          <div><span className="font-medium">Erstzulassung:</span> {formatDate(vehicle.first_registration)}</div>
          <div><span className="font-medium">HU-bis:</span> {formatDate(vehicle.hu_until)}</div>
          <div><span className="font-medium">Kilometerstand:</span> {displayValue(vehicle.mileage_km)}</div>
        </div>
      </section>

      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">Technische Daten</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><span className="font-medium">HSN :</span> {displayValue(vehicle.hsn)}</div>
          <div><span className="font-medium">TSN :</span> {displayValue(vehicle.tsn)}</div>
          <div><span className="font-medium">Hubraum (cm³):</span> {displayValue(vehicle.engine_ccm)}</div>
          <div><span className="font-medium">Leistung (kW):</span> {displayValue(vehicle.power_kw)}</div>
          <div><span className="font-medium">Leergewicht (kg):</span> {displayValue(vehicle.kerb_weight_kg)}</div>
          <div><span className="font-medium">Zulässiges Gesamtgewicht (kg):</span> {displayValue(vehicle.gross_weight_kg)}</div>
          <div><span className="font-medium">Achslast 1 (kg):</span> {displayValue(vehicle.axle_load_1_kg)}</div>
          <div><span className="font-medium">Achslast 2 (kg):</span> {displayValue(vehicle.axle_load_2_kg)}</div>
          <div><span className="font-medium">Achslast 3 (kg):</span> {displayValue(vehicle.axle_load_3_kg)}</div>
          <div><span className="font-medium">Achslast 4 (kg):</span> {displayValue(vehicle.axle_load_4_kg)}</div>
          <div><span className="font-medium">Vorbesitzer:</span> {displayValue(vehicle.previous_owners)}</div>
        </div>
      </section>
  {isAdmin ? (
      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">Einkauf</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><span className="font-medium">Kaufpreis:</span> {formatCurrency(vehicle.purchase_price)}</div>
          <div><span className="font-medium">USt-Status:</span> {displayValue(vehicle.vat_type)}</div>
          <div><span className="font-medium">Zahlungsart Einkauf:</span> {displayValue(vehicle.purchase_payment_method)}</div>
        </div>
      </section>
  ) : null}

  {isAdmin ? (
      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">Verkauf</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><span className="font-medium">Status:</span> {displayValue(vehicle.status)}</div>
          <div><span className="font-medium">Käufer:</span> {displayValue(vehicle.buyer_name)}</div>
          <div><span className="font-medium">Verkaufspreis:</span> {formatCurrency(vehicle.sale_price)}</div>
          <div><span className="font-medium">Verkaufsdatum:</span> {formatDate(vehicle.sale_date)}</div>
          <div><span className="font-medium">Zahlungsart Verkauf:</span> {displayValue(vehicle.sale_payment_method)}</div>
          <div><span className="font-medium">Verkaufsart:</span> {displayValue(vehicle.sale_vat_type)}</div>
        </div>
      </section>
  ) : null}
{isAdmin ? (
      <section className="rounded-2xl border p-5">
        <h2 className="mb-4 text-lg font-medium">OCR</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div><span className="font-medium">OCR-Status:</span> {displayValue(vehicle.ocr_status)}</div>
          <div><span className="font-medium">Extrahierte Felder:</span> {vehicle.ocr_extracted_json ? 'Vorhanden' : '—'}</div>
        </div>

        {vehicle.ocr_raw_text ? (
          <div className="mt-4">
            <p className="mb-2 font-medium">OCR-Rohtext</p>
            <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs whitespace-pre-wrap">
              {vehicle.ocr_raw_text}
            </pre>
          </div>
        ) : null}
      </section>
  ) : null}

      <section className="rounded-2xl border p-5">
  <h2 className="mb-4 text-lg font-medium">Dokumente</h2>

  {isAdmin ? (
  <form action={uploadVehicleDocument} className="mb-6 grid gap-4 md:grid-cols-4">
    <input type="hidden" name="vehicle_id" value={vehicle.id} />

    <div className="md:col-span-1">
      <label htmlFor="document_type" className="mb-1 block text-sm font-medium">
        Dokumenttyp
      </label>
      <select
        id="document_type"
        name="document_type"
        required
        defaultValue=""
        className="w-full rounded-lg border px-3 py-2"
      >
        <option value="">Bitte wählen</option>
        <option value="fahrzeugbrief">Fahrzeugbrief</option>
        <option value="fahrzeugschein">Fahrzeugschein</option>
        <option value="kaufvertrag">Kaufvertrag</option>
        <option value="tuevbericht">TÜV-Bericht</option>
        <option value="fahrzeugbild">Fahrzeugbild</option>
      </select>
    </div>

    <div className="md:col-span-2">
      <label htmlFor="document" className="mb-1 block text-sm font-medium">
        Datei
      </label>
      <input
        id="document"
        name="document"
        type="file"
        required
        accept=".pdf,image/*"
        className="w-full rounded-lg border px-3 py-2"
      />
    </div>

    <div className="md:col-span-1 flex items-end">
      <button
        type="submit"
        className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Hochladen
      </button>
    </div>
  </form>
) : null}

  {documents && documents.length > 0 ? (
    <div className="space-y-3">
      {documents.map((doc) => (
  <div
    key={doc.id}
    className="flex items-center justify-between rounded-xl border p-4"
  >
    <div>
      <p className="font-medium">{doc.document_type}</p>
      <p className="text-sm text-gray-600">{doc.file_name}</p>
      <p className="text-xs text-gray-500">
        Bucket: {doc.storage_bucket}
      </p>
    </div>

   <div className="flex items-center gap-3">
  <div className="text-sm text-gray-500">
    {formatDate(doc.created_at)}
  </div>

  <a
    href={`/api/documents/${doc.id}/view`}
    target="_blank"
    rel="noreferrer"
    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
  >
    Ansehen
  </a>

  {isAdmin ? (
    <form action={deleteVehicleDocument}>
      <input type="hidden" name="document_id" value={doc.id} />
      <input type="hidden" name="vehicle_id" value={vehicle.id} />
      <button
        type="submit"
        className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        Löschen
      </button>
    </form>
  ) : null}
</div>
  </div>
))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">Noch keine Dokumente vorhanden.</p>
  )}
</section>
    </main>
  )
}