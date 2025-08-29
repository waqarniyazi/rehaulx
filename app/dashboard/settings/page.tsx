"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { createClient as createBrowserSupabase } from "@/lib/supabase/client"

export default function SettingsPage() {
  const supabase = createBrowserSupabase()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (u) {
        setEmail(u.email || "")
        setName((u.user_metadata as any)?.full_name || "")
        setAvatarUrl((u.user_metadata as any)?.avatar_url || "")
      }
    })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({
        email: email || undefined,
        data: { full_name: name, avatar_url: avatarUrl },
      })
      if (error) throw error
      setMessage("Profile updated")
    } catch (e: any) {
      setMessage(e.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!password) return
    setSaving(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword("")
      setMessage("Password updated")
    } catch (e: any) {
      setMessage(e.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/profile/avatar', { method: 'POST', body })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || 'Upload failed')
      return
    }
    setAvatarUrl(data.url)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 lg:px-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 lg:px-6">
        <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-white font-semibold mb-4">Profile</div>
          <div className="grid gap-3">
            <div>
              <Label className="text-white/70">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-white/70">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/10 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {avatarUrl ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <Label className="text-white/70">Avatar</Label>
                <Input type="file" accept="image/*" onChange={onAvatarChange} className="bg-white/5 border-white/10 text-white" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={saveProfile} disabled={saving} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">Save</Button>
            </div>
            {message && <div className="text-white/70 text-sm">{message}</div>}
          </div>
        </Card>
        <Card className="p-4 bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="text-white font-semibold mb-4">Change Password</div>
          <div className="grid gap-3">
            <div>
              <Label className="text-white/70">New Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Button onClick={changePassword} disabled={saving || !password} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10">Update Password</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
