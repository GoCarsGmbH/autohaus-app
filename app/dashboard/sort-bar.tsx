'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SortBar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const sort = searchParams.get('sort') ?? 'created_at'
  const dir = searchParams.get('dir') ?? 'desc'

  function updateSort(nextSort: string, nextDir: string) {
    const params = new URLSearchParams(searchParams.toString())

    params.set('sort', nextSort)
    params.set('dir', nextDir)

    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={sort}
        onChange={(e) => updateSort(e.target.value, dir)}
        className="rounded-lg border px-4 py-2 text-sm"
      >
        <option value="created_at">Zugefügtes Datum</option>
        <option value="first_registration">Erstzulassung</option>
        <option value="brand_model">Marke & Modell</option>
        <option value="gear_type">Getriebe</option>
        <option value="fuel_type">Kraftstoff</option>
        
      </select>

      <select
        value={dir}
        onChange={(e) => updateSort(sort, e.target.value)}
        className="rounded-lg border px-4 py-2 text-sm"
      >
        <option value="asc">Aufsteigend</option>
        <option value="desc">Absteigend</option>
      </select>
    </div>
  )
}