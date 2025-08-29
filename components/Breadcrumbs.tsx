"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="px-4 lg:px-6 py-2">
      <ol className="flex items-center gap-2 text-sm text-white/60">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-white">{item.label}</span>
            )}
            {idx < items.length - 1 && (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
