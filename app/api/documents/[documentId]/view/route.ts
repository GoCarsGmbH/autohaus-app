import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type RouteProps = {
  params: Promise<{ documentId: string }>
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { documentId } = await params
  const supabase = createAdminClient()

  const { data: document, error: documentError } = await supabase
    .from('vehicle_documents')
    .select('id, storage_bucket, storage_path')
    .eq('id', documentId)
    .single()

  if (documentError || !document) {
    return NextResponse.json(
      { error: 'Dokument nicht gefunden.' },
      { status: 404 }
    )
  }

  const { data, error } = await supabase.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.storage_path, 60 * 5)

  if (error || !data?.signedUrl) {
    return NextResponse.json(
      { error: `Signed URL konnte nicht erzeugt werden: ${error?.message ?? 'Unbekannter Fehler'}` },
      { status: 500 }
    )
  }

  return NextResponse.redirect(data.signedUrl)
}