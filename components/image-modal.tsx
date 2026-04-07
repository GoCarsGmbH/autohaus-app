'use client'

import { useState } from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
}

export default function ImageModal({ src, alt, className }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
      />

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setOpen(false)}
        >
          {/* Stop click bubbling */}
          <div onClick={(e) => e.stopPropagation()}>
            <img
              src={src}
              alt={alt}
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            />

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  )
}