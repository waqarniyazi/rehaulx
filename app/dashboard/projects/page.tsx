"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumbs } from "@/components/Breadcrumbs"

type Project = {
  id: string
  title: string
  content_type: string
  status: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/projects", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProjects(d.projects || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 lg:px-6">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects" }]} />
      </div>
      <div className="px-4 lg:px-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="text-white font-semibold">All Projects</div>
            <Button onClick={() => (window.location.href = "/repurpose")} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">New Project</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="text-left px-4 py-2">Title</th>
                  <th className="text-left px-4 py-2">Type</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-left px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="px-4 py-4 text-white/60" colSpan={4}>Loading…</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td className="px-4 py-4 text-white/60" colSpan={4}>No projects yet</td></tr>
                ) : (
                  projects.map((p) => (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="px-4 py-3 text-white">{p.title}</td>
                      <td className="px-4 py-3 text-white/80">{p.content_type}</td>
                      <td className="px-4 py-3"><Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{p.status}</Badge></td>
                      <td className="px-4 py-3 text-white/60">{new Date(p.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
