"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Eye, EyeOff, CheckCircle, XCircle, Sparkles, Github } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const { signIn, signUp, resetPassword, signInWithOAuth, signInWithMagicLink, checkEmailExists } = useAuth()
  const [signupStep, setSignupStep] = useState<1 | 2>(1)
  const [showForgot, setShowForgot] = useState(false)
  const [showCheckEmail, setShowCheckEmail] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)

  // Password strength validation
  const passwordRequirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "Contains uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: "Contains lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: "Contains number", test: (pwd: string) => /\d/.test(pwd) },
    { label: "Contains special character", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
  ]

  const isPasswordStrong = useMemo(() => passwordRequirements.every((req) => req.test(password)), [password])

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setFirstName("")
    setLastName("")
    setCompany("")
    setRole("")
    setShowPassword(false)
    setSignupStep(1)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success("Welcome back!", { description: "You've been signed in successfully" })
      onClose()
      resetForm()
    } catch (error: any) {
      toast.error("Sign in failed", { description: error.message || "Check your credentials and try again" })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signupStep === 1) {
      if (!email || !password) {
        toast.error("Email & password required")
        return
      }
      if (!isPasswordStrong) {
        toast.error("Password too weak", { description: "Please create a stronger password" })
        return
      }
      
      // Check if email already exists
      setEmailCheckLoading(true)
      try {
        const emailExists = await checkEmailExists(email)
        if (emailExists) {
          toast.error("Account already exists", { 
            description: "An account with this email already exists. Try signing in instead." 
          })
          setActiveTab("signin")
          return
        }
        setSignupStep(2)
      } catch (error) {
        toast.error("Error checking email", { description: "Please try again" })
      } finally {
        setEmailCheckLoading(false)
      }
      return
    }
    if (!firstName || !lastName) {
      toast.error("Please fill in your name")
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, firstName, lastName, company, role)
      setShowCheckEmail(true)
    } catch (error: any) {
      // toast handled in hook when appropriate
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Email required", { description: "Please enter your email address" })
      return
    }
    setLoading(true)
    try {
      await resetPassword(email)
      toast.success("Reset email sent", { description: "Check your email for the link" })
      setShowCheckEmail(true)
    } catch (error: any) {
      toast.error("Reset failed", { description: error.message || "Please try again" })
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Email required", { description: "Please enter your email address" })
      return
    }
    setLoading(true)
    try {
      await signInWithMagicLink(email)
      setShowCheckEmail(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Welcome to ReHaulX
          </DialogTitle>
          <DialogDescription className="text-white/60">Transform your video content with AI-powered tools</DialogDescription>
        </DialogHeader>

        {showCheckEmail ? (
          <div className="space-y-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">Check your email</h2>
            <p className="text-white/60">We sent a confirmation/sign-in link to {email}. Follow it to continue.</p>
            <Button onClick={onClose} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">Close</Button>
          </div>
        ) : showForgot ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-white/80">Email Address</Label>
              <Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" className="text-white/60 hover:text-white" onClick={() => setShowForgot(false)}>Back</Button>
              <Button onClick={handleResetPassword} disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Send reset link
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSignupStep(1) }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
              <TabsTrigger value="signin" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all duration-300">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 transition-all duration-300">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4 mt-6">
              {/* Social logins */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => signInWithOAuth('google')} className="bg-[#24292e] text-white hover:bg-[#24292e]/90">
                  <span className="mr-2 h-4 w-4 rounded-sm bg-white/10 text-white flex items-center justify-center text-[10px]">G</span>
                  Google
                </Button>
                <Button onClick={() => signInWithOAuth('github')} className="bg-[#24292e] text-white hover:bg-[#24292e]/90">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
              </div>
              <div className="relative my-2">
                <div className="h-px w-full bg-white/10" />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 px-2 text-xs text-white/40 bg-black">or</span>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white/80">Email Address</Label>
                  <Input id="signin-email" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white/80">Password</Label>
                  <div className="relative">
                    <Input id="signin-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/30 focus:ring-white/10" />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button type="button" variant="link" className="px-0 text-sm text-blue-400 hover:text-blue-300" onClick={() => setShowForgot(true)} disabled={loading}>Forgot password?</Button>
                  <Button type="button" variant="link" className="px-0 text-sm text-white/70 hover:text-white" onClick={handleMagicLink} disabled={loading}>Continue with Email</Button>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>) : (<><Mail className="mr-2 h-4 w-4" /> Sign In</>)}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={handleSignUp} className="space-y-4 transition-all duration-300">
                {signupStep === 1 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white/80">Email Address</Label>
                      <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white/80">Create Strong Password</Label>
                      <div className="relative">
                        <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-11 pr-10 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 text-white/60 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {password && (
                        <div className="space-y-2 mt-3">
                          <p className="text-sm font-medium text-white/80">Password Requirements:</p>
                          <div className="space-y-1">
                            {passwordRequirements.map((req, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                {req.test(password) ? <CheckCircle className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-white/40" />}
                                <span className={req.test(password) ? 'text-green-400' : 'text-white/60'}>{req.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button type="submit" disabled={loading || emailCheckLoading || !isPasswordStrong} className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
                      {emailCheckLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking email...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname" className="text-white/80">First Name</Label>
                        <Input id="signup-firstname" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastname" className="text-white/80">Last Name</Label>
                        <Input id="signup-lastname" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-company" className="text-white/80">Company/Organization (optional)</Label>
                      <Input id="signup-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-role" className="text-white/80">Role</Label>
                      <Input id="signup-role" type="text" value={role} onChange={(e) => setRole(e.target.value)} className="h-11 bg-white/5 border-white/20 text-white placeholder:text-white/40" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button type="button" variant="ghost" className="text-white/60 hover:text-white" onClick={() => setSignupStep(1)}>Back</Button>
                      <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Create Account
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="text-center text-sm text-white/40 border-t border-white/10 pt-4">By continuing, you agree to our Terms of Service and Privacy Policy</div>
      </DialogContent>
    </Dialog>
  )
}
