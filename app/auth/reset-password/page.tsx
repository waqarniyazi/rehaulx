"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, CheckCircle, XCircle, Lock, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "Contains uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "Contains lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "Contains number", test: (pwd: string) => /\d/.test(pwd) },
    { label: "Contains special character", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  const isPasswordStrong = passwordRequirements.every((req) => req.test(password))
  const passwordsMatch = password === confirmPassword && password.length > 0

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        // User is now authenticated and can update their password
      }
    })
  }, [supabase])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordStrong) {
      toast.error("Password too weak", {
        description: "Please create a stronger password",
      })
      return
    }

    if (!passwordsMatch) {
      toast.error("Passwords do not match", {
        description: "Please make sure both passwords are the same",
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      toast.success("Password updated!", {
        description: "Your password has been successfully updated",
      })

      router.push("/")
    } catch (error: any) {
      toast.error("Password update failed", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Reset Your Password
            </h1>
            <p className="text-white/60 mt-2">Create a new secure password for your account</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10"
              />
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white/80">Password Requirements:</p>
                <div className="space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {req.test(password) ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <XCircle className="h-4 w-4 text-white/40" />
                      )}
                      <span className={req.test(password) ? "text-green-400" : "text-white/60"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-white/5">
                {passwordsMatch ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={passwordsMatch ? "text-green-400" : "text-red-400"}>
                  Passwords {passwordsMatch ? "match" : "do not match"}
                </span>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !isPasswordStrong || !passwordsMatch} 
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-2xl shadow-blue-500/25 hover:scale-105 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-white/40 mt-6">
            After updating, you'll be redirected to sign in with your new password
          </div>
        </div>
      </div>
    </div>
  )
}
