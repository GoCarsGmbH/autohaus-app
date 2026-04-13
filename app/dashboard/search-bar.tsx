'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function SearchBar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState(searchParams.get('query') ?? '')

  // URL -> Input synchron halten, falls man per Back/Forward navigiert
  useEffect(() => {
    const currentQuery = searchParams.get('query') ?? ''
    if (currentQuery !== value) {
      setValue(currentQuery)
    }
    // absichtlich nur auf searchParams reagieren
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (value.trim()) {
        params.set('query', value.trim())
      } else {
        params.delete('query')
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
      const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname

      // Nur navigieren, wenn sich die URL wirklich ändert
      if (nextUrl !== currentUrl) {
        router.replace(nextUrl)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [value, pathname, router]) // searchParams hier bewusst NICHT rein

  function clearSearch() {
    setValue('')

    const params = new URLSearchParams(searchParams.toString())
    params.delete('query')

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(nextUrl)

    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Suche nach ID, Marke, Modell oder FIN"
        className="w-full rounded-lg border px-4 py-2 pr-10 text-sm"
      />

      {value && (
        <button
          onClick={clearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-black"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  )
}