`use client`

import { useRouter } from "next/navigation"
import React from "react"

interface DynamicLinkProps {
  /**
   * Base path to navigate to, e.g. "/auth/login" or "/dashboard"
   */
  href: string
  /**
   * Optional query parameters to append to the URL
   */
  query?: Record<string, string | number | boolean | null | undefined>
  /**
   * Whether to use router.replace instead of router.push
   */
  replace?: boolean
  /**
   * Optional CSS classes for the wrapper element
   */
  className?: string
  /**
   * Content to render inside the clickable area
   */
  children: React.ReactNode
}

export const DynamicLink: React.FC<DynamicLinkProps> = ({
  href,
  query,
  replace = false,
  className,
  children,
}) => {
  const router = useRouter()

  const buildUrl = () => {
    if (!query || Object.keys(query).length === 0) return href

    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined) return
      params.set(key, String(value))
    })

    const qs = params.toString()
    if (!qs) return href

    return href.includes("?") ? `${href}&${qs}` : `${href}?${qs}`
  }

  const handleNavigate = () => {
    const url = buildUrl()
    if (replace) {
      router.replace(url)
    } else {
      router.push(url)
    }
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLSpanElement> = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleNavigate()
    }
  }

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {children}
    </span>
  )
}


