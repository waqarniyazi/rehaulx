"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, LayoutDashboard, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { AuthModal } from "@/components/auth/AuthModal"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, signOut, loading } = useAuth()
  const searchParams = useSearchParams()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Repurpose", href: process.env.NODE_ENV === "development" ? "http://app.localhost:3000" : "https://app.rehaulx.com" },
    { name: "About", href: "/about" },
    { name: "Pricing", href: "/pricing" },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  // Auto-open auth modal when ?auth=1 is in the URL (CTA-driven login)
  useEffect(() => {
    const shouldOpen = searchParams.get("auth") === "1"
    if (shouldOpen && !user && !loading) {
      setShowAuthModal(true)
    }
  }, [searchParams, user, loading])

  // If the user becomes signed in, close modal and strip flag
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false)
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete("auth")
        window.history.replaceState(null, "", url.toString())
      } catch {}
    }
  }, [user, showAuthModal])

  // After sign-in, honor a ?redirect= param if present (cross-subdomain handoff)
  useEffect(() => {
    if (!user) return
    const redirect = searchParams.get("redirect")
    if (redirect) {
      try {
        window.location.href = redirect
      } catch {}
    }
  }, [user, searchParams])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-8 flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  ReHaulX
                </span>
              </div>
            </Link>
            <nav className="flex items-center space-x-8 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="transition-colors text-white/80 hover:text-blue-400"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-white/10 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden text-white"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 bg-black/95 backdrop-blur-xl border-white/10">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl text-white">ReHaulX</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-white/80 transition-colors hover:text-blue-400"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Link href="/" className="md:hidden flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl text-white">ReHaulX</span>
              </Link>
            </div>
            <nav className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user.user_metadata?.first_name?.charAt(0)?.toUpperCase() ||
                            user.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-black/95 backdrop-blur-xl border-white/10"
                    align="end"
                    forceMount
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-white">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-white/60">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem asChild className="text-white hover:bg-white/10">
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-white hover:bg-white/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : loading ? (
                <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    try {
                      const host = window.location.hostname
                      const isApp = host === "app.localhost" || host.startsWith("app.")
                      if (isApp) {
                        setShowAuthModal(true)
                      } else {
                        const appUrl = process.env.NODE_ENV === "development"
                          ? "http://app.localhost:3000"
                          : "https://app.rehaulx.com"
                        window.location.href = `${appUrl}?auth=1`
                      }
                    } catch {
                      setShowAuthModal(true)
                    }
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          // Clean the auth flag from URL
          try {
            const url = new URL(window.location.href)
            url.searchParams.delete("auth")
            window.history.replaceState(null, "", url.toString())
          } catch {}
        }}
      />
    </>
  )
}
