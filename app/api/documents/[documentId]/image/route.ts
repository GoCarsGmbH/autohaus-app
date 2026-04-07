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
    .select('id, storage_bucket, storage_path, mime_type')
    .eq('id', documentId)
    .single()

  if (documentError || !document) {
    return NextResponse.json({ error: 'Bild nicht gefunden.' }, { status: 404 })
  }

  const { data, error } = await supabase.storage
    .from(document.storage_bucket)
    .download(document.storage_path)

  if (error || !data) {
    return NextResponse.json({ error: 'Bild konnte nicht geladen werden.' }, { status: 500 })
  }

  const arrayBuffer = await data.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': document.mime_type || 'application/octet-stream',
      'Cache-Control': 'private, max-age=60',
    },
  })
}
