import React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Layout, ShieldCheck, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 lg:py-24 bg-gradient-to-b from-background via-background to-secondary/30">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-6 flex flex-col items-start space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Zap className="h-3.5 w-3.5" />
                <span>Agile Project Management System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Manage Your Projects <span className="text-primary underline decoration-primary/30 underline-offset-4">Efficiently</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Streamline workflows, track issues, and collaborate with your team seamlessly using ProjectFlow — your personalized workspace.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold shadow-md px-7">
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-medium px-7">
                    Login
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="pt-6 grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium text-muted-foreground sm:text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Task Status Board</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Real-time Team Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Custom Workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Analytics & Insights</span>
                </div>
              </div>
            </div>

            {/* Right Illustration Column */}
            <div className="lg:col-span-6 w-full">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Decorative Glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 to-primary/10 blur-xl opacity-70" />

                {/* Modern Kanban Board Mockup Illustration */}
                <Card className="relative border border-border/80 bg-card/95 backdrop-blur shadow-2xl rounded-2xl overflow-hidden">
                  {/* Top Bar Mockup */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-400/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">ProjectFlow Board</span>
                    <div className="h-4 w-4 rounded-full bg-primary/20" />
                  </div>

                  {/* Board Content */}
                  <div className="p-4 sm:p-6 grid grid-cols-3 gap-3 sm:gap-4 bg-background/50">
                    {/* To Do Column */}
                    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2.5 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">To Do</span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">3</span>
                      </div>

                      <div className="rounded-md border border-border bg-card p-2.5 shadow-xs space-y-1.5">
                        <div className="h-2 w-12 rounded bg-primary/30" />
                        <p className="text-xs font-medium text-foreground">Setup Auth UI</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-muted-foreground">PF-101</span>
                          <div className="h-4 w-4 rounded-full bg-primary text-[9px] text-primary-foreground flex items-center justify-center font-bold">JD</div>
                        </div>
                      </div>

                      <div className="rounded-md border border-border bg-card p-2.5 shadow-xs space-y-1.5">
                        <div className="h-2 w-8 rounded bg-emerald-500/30" />
                        <p className="text-xs font-medium text-foreground">Design Tokens</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-muted-foreground">PF-102</span>
                          <div className="h-4 w-4 rounded-full bg-amber-500 text-[9px] text-white flex items-center justify-center font-bold">SK</div>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2.5 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary uppercase">In Progress</span>
                        <span className="rounded bg-primary/20 text-primary px-1.5 py-0.5 text-[10px] font-bold">2</span>
                      </div>

                      <div className="rounded-md border border-primary/30 bg-card p-2.5 shadow-sm space-y-1.5 ring-1 ring-primary/20">
                        <div className="h-2 w-14 rounded bg-primary" />
                        <p className="text-xs font-semibold text-foreground">Integrate Router</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-primary font-medium">PF-103</span>
                          <div className="h-4 w-4 rounded-full bg-indigo-600 text-[9px] text-white flex items-center justify-center font-bold">AL</div>
                        </div>
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2.5 sm:p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 uppercase">Done</span>
                        <span className="rounded bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 text-[10px] font-bold">4</span>
                      </div>

                      <div className="rounded-md border border-border bg-card p-2.5 shadow-xs space-y-1.5 opacity-80">
                        <div className="h-2 w-10 rounded bg-emerald-500/40" />
                        <p className="text-xs font-medium text-foreground line-through">Init Vite React</p>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[10px] text-muted-foreground">PF-100</span>
                          <div className="h-4 w-4 rounded-full bg-emerald-600 text-[9px] text-white flex items-center justify-center font-bold">PF</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-12 border-t border-border/60 bg-muted/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="p-6 flex flex-col items-start space-y-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Layout className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Task Status Board</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize task progression effortlessly with drag-and-drop workflow status columns.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="p-6 flex flex-col items-start space-y-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Team Collaboration</h3>
                <p className="text-sm text-muted-foreground">
                  Assign issues, comment on tasks, and sync progress across cross-functional teams.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card/60 backdrop-blur">
              <CardContent className="p-6 flex flex-col items-start space-y-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">Enterprise Grade</h3>
                <p className="text-sm text-muted-foreground">
                  Built with high performance, top-tier security standards, and responsive design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
