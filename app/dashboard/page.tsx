"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Linkedin,
  Twitter,
  Calendar,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Users,
  Clock,
  Sparkles,
  Video,
  BarChart3,
  Target,
  Zap,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header/Header"
import { Footer } from "@/components/Footer/Footer"
import Link from "next/link"
import { toast } from "sonner"

interface Project {
  id: string
  title: string
  contentType: string
  createdAt: string
  videoUrl: string
  thumbnail: string
  status: "completed" | "draft"
  views?: number
  engagement?: number
}

interface DashboardStats {
  totalProjects: number
  totalViews: number
  avgEngagement: number
  timeSaved: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalViews: 0,
    avgEngagement: 0,
    timeSaved: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchStats()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const response = await fetch(`/api/projects?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        console.error("Failed to fetch projects:", response.statusText)
        setProjects([])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects", {
        description: "Please try again",
      })
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/dashboard-stats?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setStats(
          data.stats || {
            totalProjects: 0,
            totalViews: 0,
            avgEngagement: 0,
            timeSaved: 0,
          },
        )
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Keep default stats on error
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId))
        toast.success("Project deleted", {
          description: "Project has been removed",
        })
      } else {
        throw new Error("Failed to delete project")
      }
    } catch (error) {
      toast.error("Failed to delete project", {
        description: "Please try again",
      })
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "linkedin":
        return Linkedin
      case "twitter":
        return Twitter
      default:
        return FileText
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "short-article":
        return "Short Article"
      case "long-article":
        return "Long Article"
      case "linkedin":
        return "LinkedIn Post"
      case "twitter":
        return "Twitter Thread"
      default:
        return type
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Please sign in to view your dashboard</h1>
            <p className="text-white/60 mb-6">Access your projects, analytics, and content creation tools</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
                Go Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent mb-2">
              Welcome back, {user.user_metadata?.first_name || "Creator"}!
            </h1>
            <p className="text-white/60">Manage your content projects and track your success</p>
          </div>
          <Link href="/">
            <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Engagement</p>
                  <p className="text-2xl font-bold text-white">{stats.avgEngagement}%</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Hours Saved</p>
                  <p className="text-2xl font-bold text-white">{stats.timeSaved}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex-col gap-2"
                >
                  <Video className="h-6 w-6 text-blue-400" />
                  <span>Create Content</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex-col gap-2"
                onClick={() => toast.info("Analytics coming soon!")}
              >
                <BarChart3 className="h-6 w-6 text-green-400" />
                <span>View Analytics</span>
              </Button>
              <Button
                variant="outline"
                className="w-full h-20 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 flex-col gap-2"
                onClick={() => toast.info("AI Insights coming soon!")}
              >
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span>AI Insights</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList className="bg-white/10 border-white/20">
                <TabsTrigger value="all" className="data-[state=active]:bg-white/20 text-white">
                  All Projects
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-white/20 text-white">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="draft" className="data-[state=active]:bg-white/20 text-white">
                  Drafts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse bg-white/5 border-white/10">
                        <CardHeader>
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-32 bg-white/10 rounded mb-4"></div>
                          <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
                          <div className="h-3 bg-white/10 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : projects.length === 0 ? (
                  <Card className="text-center py-12 bg-white/5 border-white/10">
                    <CardContent>
                      <div className="h-16 w-16 mx-auto mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-white">No projects yet</h3>
                      <p className="text-white/60 mb-6">Create your first content project to get started</p>
                      <Link href="/">
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Project
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                      const ContentIcon = getContentTypeIcon(project.contentType)
                      return (
                        <Card
                          key={project.id}
                          className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <ContentIcon className="h-4 w-4 text-blue-400" />
                                <Badge
                                  variant={project.status === "completed" ? "default" : "secondary"}
                                  className={
                                    project.status === "completed"
                                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                                      : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                                  }
                                >
                                  {project.status}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                  onClick={() => toast.info("Edit feature coming soon!")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteProject(project.id)}
                                  className="h-8 w-8 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardTitle className="text-sm line-clamp-2 text-white">{project.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img
                              src={project.thumbnail || "/placeholder.svg"}
                              alt={project.title}
                              className="w-full aspect-video object-cover rounded mb-4 border border-white/10"
                            />
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white/80">{getContentTypeLabel(project.contentType)}</span>
                                <div className="flex items-center gap-1 text-white/60">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(project.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              {project.status === "completed" &&
                                project.views !== undefined &&
                                project.engagement !== undefined && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-white/60">
                                      <span>Views: {project.views?.toLocaleString()}</span>
                                      <span>Engagement: {project.engagement}%</span>
                                    </div>
                                    <Progress value={project.engagement} className="h-1 bg-white/10" />
                                  </div>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((p) => p.status === "completed")
                    .map((project) => {
                      const ContentIcon = getContentTypeIcon(project.contentType)
                      return (
                        <Card key={project.id} className="bg-white/5 backdrop-blur-xl border border-white/10">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <ContentIcon className="h-4 w-4 text-blue-400" />
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">completed</Badge>
                            </div>
                            <CardTitle className="text-sm line-clamp-2 text-white">{project.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img
                              src={project.thumbnail || "/placeholder.svg"}
                              alt={project.title}
                              className="w-full aspect-video object-cover rounded mb-4 border border-white/10"
                            />
                            <div className="flex items-center justify-between text-sm text-white/60">
                              <span>{getContentTypeLabel(project.contentType)}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </TabsContent>

              <TabsContent value="draft">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((p) => p.status === "draft")
                    .map((project) => {
                      const ContentIcon = getContentTypeIcon(project.contentType)
                      return (
                        <Card key={project.id} className="bg-white/5 backdrop-blur-xl border border-white/10">
                          <CardHeader>
                            <div className="flex items-center gap-2">
                              <ContentIcon className="h-4 w-4 text-blue-400" />
                              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">draft</Badge>
                            </div>
                            <CardTitle className="text-sm line-clamp-2 text-white">{project.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img
                              src={project.thumbnail || "/placeholder.svg"}
                              alt={project.title}
                              className="w-full aspect-video object-cover rounded mb-4 border border-white/10"
                            />
                            <div className="flex items-center justify-between text-sm text-white/60">
                              <span>{getContentTypeLabel(project.contentType)}</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
