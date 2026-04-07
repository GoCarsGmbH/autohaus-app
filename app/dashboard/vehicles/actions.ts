'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Feld "${key}" ist erforderlich.`)
  }
  return value.trim()
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  return value.trim()
}

function optionalInteger(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    throw new Error(`Feld "${key}" muss eine ganze Zahl sein.`)
  }
  return parsed
}

function optionalDecimal(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== 'string' || value.trim() === '') {
    return null
  }
  const normalized = value.replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed)) {
    throw new Error(`Feld "${key}" muss eine Zahl sein.`)
  }
  return parsed
}

export async function createVehicle(formData: FormData) {
  const supabase = await createClient()

  const payload = {
    brand: requiredString(formData, 'brand'),
    model: requiredString(formData, 'model'),
    color: optionalString(formData, 'color'),
    vin: requiredString(formData, 'vin'),
    first_registration: optionalString(formData, 'first_registration'),
    purchase_price: optionalDecimal(formData, 'purchase_price'),
    hu_until: optionalString(formData, 'hu_until'),

    engine_ccm: optionalInteger(formData, 'engine_ccm'),
    power_kw: optionalInteger(formData, 'power_kw'),
    kerb_weight_kg: optionalInteger(formData, 'kerb_weight_kg'),
    gross_weight_kg: optionalInteger(formData, 'gross_weight_kg'),
    axle_load_1_kg: optionalInteger(formData, 'axle_load_1_kg'),
    axle_load_2_kg: optionalInteger(formData, 'axle_load_2_kg'),
    axle_load_3_kg: optionalInteger(formData, 'axle_load_3_kg'),
    axle_load_4_kg: optionalInteger(formData, 'axle_load_4_kg'),
    previous_owners: optionalInteger(formData, 'previous_owners'),

    mileage_km: optionalInteger(formData, 'mileage_km'),
    vat_type: optionalString(formData, 'vat_type'),
    purchase_payment_method: optionalString(formData, 'purchase_payment_method'),
  }

  const { error } = await supabase.from('vehicles').insert(payload)

  if (error) {
    throw new Error(`Fehler beim Speichern: ${error.message}`)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export type SaleFormState = {
  message?: string
}

export async function saveVehicleSale(
  _prevState: SaleFormState,
  formData: FormData
): Promise<SaleFormState> {
  const supabase = await createClient()

  const vehicleId = requiredString(formData, 'vehicle_id')
  const buyerName = requiredString(formData, 'buyer_name')
  const salePrice = optionalDecimal(formData, 'sale_price')
  const salePaymentMethod = requiredString(formData, 'sale_payment_method')
  const saleDate = optionalString(formData, 'sale_date')
  const status = optionalString(formData, 'status') ?? 'verkauft'
  const saleVatType = requiredString(formData, 'sale_vat_type')

  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, vat_type')
    .eq('id', vehicleId)
    .single()

  if (vehicleError || !vehicle) {
    return {
      message: `Fahrzeug konnte nicht geladen werden: ${vehicleError?.message ?? 'Nicht gefunden'}`,
    }
  }

  if (
    saleVatType === 'differenzbesteuerung' &&
    vehicle.vat_type !== 'ohne_ust'
  ) {
    return {
      message:
        'Differenzbesteuerung ist nur zulässig, wenn der Einkauf ohne USt erfolgt ist.',
    }
  }

  const { error } = await supabase
    .from('vehicles')
    .update({
      buyer_name: buyerName,
      sale_price: salePrice,
      sale_payment_method: salePaymentMethod,
      sale_date: saleDate,
      sale_vat_type: saleVatType,
      status,
    })
    .eq('id', vehicleId)

  if (error) {
    return {
      message: `Fehler beim Speichern des Verkaufs: ${error.message}`,
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/vehicles/${vehicleId}`)
  revalidatePath(`/dashboard/vehicles/${vehicleId}/sell`)
  revalidatePath('/dashboard/analytics')
  redirect('/dashboard')

  return {}
}

export async function updateVehicle(formData: FormData) {
  const supabase = await createClient()

  const vehicleId = requiredString(formData, 'vehicle_id')

  const payload = {
    brand: requiredString(formData, 'brand'),
    model: requiredString(formData, 'model'),
    color: optionalString(formData, 'color'),
    vin: requiredString(formData, 'vin'),
    first_registration: optionalString(formData, 'first_registration'),
    purchase_price: optionalDecimal(formData, 'purchase_price'),
    hu_until: optionalString(formData, 'hu_until'),

    engine_ccm: optionalInteger(formData, 'engine_ccm'),
    power_kw: optionalInteger(formData, 'power_kw'),
    kerb_weight_kg: optionalInteger(formData, 'kerb_weight_kg'),
    gross_weight_kg: optionalInteger(formData, 'gross_weight_kg'),
    axle_load_1_kg: optionalInteger(formData, 'axle_load_1_kg'),
    axle_load_2_kg: optionalInteger(formData, 'axle_load_2_kg'),
    axle_load_3_kg: optionalInteger(formData, 'axle_load_3_kg'),
    axle_load_4_kg: optionalInteger(formData, 'axle_load_4_kg'),
    previous_owners: optionalInteger(formData, 'previous_owners'),

    mileage_km: optionalInteger(formData, 'mileage_km'),
    vat_type: optionalString(formData, 'vat_type'),
    purchase_payment_method: optionalString(formData, 'purchase_payment_method'),
    
  }

  const { error } = await supabase
    .from('vehicles')
    .update(payload)
    .eq('id', vehicleId)

  if (error) {
    throw new Error(`Fehler beim Aktualisieren: ${error.message}`)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/vehicles/${vehicleId}`)
  revalidatePath(`/dashboard/vehicles/${vehicleId}/edit`)
  redirect(`/dashboard/vehicles/${vehicleId}`)
}

function requiredFile(formData: FormData, key: string) {
  const value = formData.get(key)

  if (!(value instanceof File) || value.size === 0) {
    throw new Error(`Datei "${key}" ist erforderlich.`)
  }

  return value
}

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
}

function bucketForDocumentType(documentType: string) {
  switch (documentType) {
    case 'fahrzeugbrief':
      return 'vehicle-briefs'
    case 'fahrzeugschein':
      return 'vehicle-scheine'
    case 'kaufvertrag':
      return 'vehicle-contracts'
    case 'fahrzeugbild':
      return 'vehicle-images'
    default:
      throw new Error('Ungültiger Dokumenttyp.')
      
  }
}

function assertImageUnder100Kb(file: File, documentType: string) {
  if (documentType !== 'fahrzeugbild') return

  const maxBytes = 100 * 1024

  if (!file.type.startsWith('image/')) {
    throw new Error('Fahrzeugbild muss eine Bilddatei sein.')
  }

  if (file.size > maxBytes) {
    throw new Error('Fahrzeugbild darf maximal 100 KB groß sein.')
  }
}

export async function uploadVehicleDocument(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const vehicleId = requiredString(formData, 'vehicle_id')
  const documentType = requiredString(formData, 'document_type')
  const file = requiredFile(formData, 'document')
  assertImageUnder100Kb(file, documentType)

  const bucket = bucketForDocumentType(documentType)

  const safeName = sanitizeFileName(file.name)
  const filePath = `${vehicleId}/${Date.now()}-${safeName}`

  const { error: uploadError } = await adminSupabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Fehler beim Datei-Upload: ${uploadError.message}`)
  }

  const { error: insertError } = await supabase.from('vehicle_documents').insert({
    vehicle_id: vehicleId,
    document_type: documentType,
    file_name: file.name,
    storage_bucket: bucket,
    storage_path: filePath,
    mime_type: file.type || null,
    file_size_bytes: file.size,
  })

  if (insertError) {
    throw new Error(`Fehler beim Speichern des Dokumenteintrags: ${insertError.message}`)
  }

  revalidatePath(`/dashboard/vehicles/${vehicleId}`)
  redirect(`/dashboard/vehicles/${vehicleId}`)
}

export async function deleteVehicleDocument(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const documentId = requiredString(formData, 'document_id')
  const vehicleId = requiredString(formData, 'vehicle_id')

  const { data: document, error: fetchError } = await supabase
    .from('vehicle_documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (fetchError || !document) {
    throw new Error(`Dokument konnte nicht geladen werden: ${fetchError?.message ?? 'Nicht gefunden'}`)
  }

  const { error: storageError } = await adminSupabase.storage
    .from(document.storage_bucket)
    .remove([document.storage_path])

  if (storageError) {
    throw new Error(`Datei konnte nicht gelöscht werden: ${storageError.message}`)
  }

  const { error: deleteError } = await supabase
    .from('vehicle_documents')
    .delete()
    .eq('id', documentId)

  if (deleteError) {
    throw new Error(`Dokumenteintrag konnte nicht gelöscht werden: ${deleteError.message}`)
  }

  revalidatePath(`/dashboard/vehicles/${vehicleId}`)
  redirect(`/dashboard/vehicles/${vehicleId}`)
}