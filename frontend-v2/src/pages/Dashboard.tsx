import { PageContainer } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/toast"
import { AnimatedGridPattern } from "@/components/aceternity/animated-grid-pattern"
import { ParticleBackground } from "@/components/aceternity/particle-background"
import { Sparkles, TrendingUp, Lightbulb, Activity, Zap } from "lucide-react"

function Dashboard() {
  const { addToast } = useToast()

  const handleTestToast = () => {
    addToast({
      title: "Welcome to ShapeX v2!",
      description: "Modern React frontend with stunning animations",
      variant: "success",
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
        <AnimatedGridPattern className="opacity-30" />
        <ParticleBackground className="opacity-40" />

        <PageContainer className="relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <Badge variant="outline" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                v2.0 - Modern React Stack
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="text-gradient">ShapeX</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Autonomous AI Venture Studio
            </p>

            <p className="text-gray-500 max-w-xl mx-auto">
              Discover high-potential startup ideas powered by AI analysis of VC insights,
              market trends, and product launches.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleTestToast}>
                <Zap className="mr-2 h-4 w-4" />
                Test Toast Notification
              </Button>
              <Button size="lg" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Trends
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Component Showcase Section */}
      <PageContainer>
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">UI Components Showcase</h2>
            <p className="text-gray-400">Testing all installed components</p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-glow hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary-500" />
                  Total Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-500">142</div>
                <p className="text-sm text-gray-500">+12 this week</p>
              </CardContent>
            </Card>

            <Card className="card-glow hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent-500" />
                  Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent-500">24</div>
                <p className="text-sm text-gray-500">All time</p>
              </CardContent>
            </Card>

            <Card className="card-glow hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                  Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-500">89</div>
                <p className="text-sm text-gray-500">Active keywords</p>
              </CardContent>
            </Card>

            <Card className="card-glow hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent-500" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent-500">37</div>
                <p className="text-sm text-gray-500">High potential</p>
              </CardContent>
            </Card>
          </div>

          {/* Buttons Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>All button styles with hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </CardContent>
          </Card>

          {/* Badges Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Status indicators and labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Strategic</Badge>
                <Badge variant="secondary">Quick Win</Badge>
                <Badge variant="outline">Pending</Badge>
                <Badge variant="success">Completed</Badge>
                <Badge variant="warning">In Progress</Badge>
                <Badge variant="destructive">Failed</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tooltips Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Tooltips</CardTitle>
              <CardDescription>Hover over the buttons to see tooltips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Tooltip content="This is a tooltip on top" side="top">
                  <Button variant="outline">Hover Top</Button>
                </Tooltip>
                <Tooltip content="This is a tooltip on right" side="right">
                  <Button variant="outline">Hover Right</Button>
                </Tooltip>
                <Tooltip content="This is a tooltip on bottom" side="bottom">
                  <Button variant="outline">Hover Bottom</Button>
                </Tooltip>
                <Tooltip content="This is a tooltip on left" side="left">
                  <Button variant="outline">Hover Left</Button>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                  Modern Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  React 19, TypeScript, Vite 6.0, Tailwind CSS v4, and cutting-edge animation libraries.
                </p>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent-500" />
                  Advanced Animations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  Motion (Framer Motion) for micro-interactions and GSAP for complex 3D animations.
                </p>
              </CardContent>
            </Card>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary-500" />
                  Real-Time Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">
                  WebSocket integration for live scan progress and instant notifications.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>

      {/* Status Section */}
      <PageContainer className="py-12">
        <div className="text-center space-y-4">
          <div className="flex gap-3 justify-center items-center">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
            <p className="text-gray-500">
              Frontend v2 is running on <span className="text-primary-400 font-mono">http://localhost:5173</span>
            </p>
          </div>
          <p className="text-sm text-gray-600">
            ✅ Phase 0-1 Complete: Foundation, UI Components, Layout System
          </p>
        </div>
      </PageContainer>
    </div>
  )
}

export default Dashboard
