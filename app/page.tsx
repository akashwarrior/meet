import Link from "next/link"
import { ArrowRight, Cast, Lock, MessageSquare, Monitor, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Monitor className="h-6 w-6 text-primary" />
            <span>ScreenConnect</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
            <Link href="#security" className="text-sm font-medium transition-colors hover:text-primary">
              Security
            </Link>
            <Link href="#download" className="text-sm font-medium transition-colors hover:text-primary">
              Download
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Secure Screen Sharing & Remote Control
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connect securely with end-to-end encryption. Share your screen, transfer files, and enable remote
                    control with just a few clicks.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/connect">
                    <Button size="lg" className="gap-1.5">
                      Quick Connect
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="lg" variant="outline">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden border shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
                    <Cast className="h-16 w-16 text-primary/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Powerful Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need for seamless remote connections and collaboration
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Cast className="h-5 w-5 text-primary" />
                    Screen Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Share your entire screen or specific applications with high-quality video streaming.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    End-to-End Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    All connections are secured with industry-standard encryption protocols.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Permission Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Grant and revoke remote control permissions with a single click.</CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" />
                    Multi-Monitor Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Seamlessly switch between multiple monitors during your session.</CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Integrated Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Communicate effectively with built-in text and audio chat.</CardDescription>
                </CardContent>
              </Card>
              <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Quality Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Adjust resolution and frame rate to optimize for your connection.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for you or your team
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$0</span> / month
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Basic screen sharing</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Text chat</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>5 minute sessions</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Standard quality</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full" variant="outline">
                    Get Started
                  </Button>
                </div>
              </Card>
              <Card className="flex flex-col relative border-primary before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-primary/5 before:backdrop-blur-sm">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Popular
                </div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$9.99</span> / month
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Advanced screen sharing</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Text & audio chat</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Unlimited sessions</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>HD quality</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>File transfer</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Session recording</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full">Subscribe</Button>
                </div>
              </Card>
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold">$29.99</span> / month
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Team management</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>4K quality</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Advanced security</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-primary">✓</span>
                      <span>Custom branding</span>
                    </li>
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="security" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Security First Approach</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Your privacy and security are our top priorities. We implement industry-leading security measures to
                    protect your data and connections.
                  </p>
                </div>
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>End-to-end encryption for all connections</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Two-factor authentication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Permission-based access control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Secure WebRTC with DTLS-SRTP</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Regular security audits</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden border">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
                    <div className="p-8 rounded-full bg-background/80 backdrop-blur-sm">
                      <Shield className="h-20 w-20 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="download" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Get Started Today</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Download ScreenConnect for your platform or use the web version
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Button size="lg" className="gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Windows
                </Button>
                <Button size="lg" variant="outline" className="gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-1 .6-1.7 1.8-1.7 3s.7 2.4 1.7 3c-.3 1.2 0 2.5 1 3.4.8.8 2.1 1.2 3.3 1 .6 1 1.8 1.6 3 1.6s2.4-.6 3-1.7c1.2.3 2.5 0 3.4-1 .8-.8 1.2-2 1-3.3 1-.6 1.7-1.8 1.7-3s-.7-2.4-1.7-3c.3-1.2 0-2.5-1-3.4a3.7 3.7 0 0 0-3.3-1c-.6-1-1.8-1.6-3-1.6Z"></path>
                    <path d="M12 11v5"></path>
                    <path d="M9 14h6"></path>
                  </svg>
                  macOS
                </Button>
                <Button size="lg" variant="outline" className="gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M16 16a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"></path>
                    <path d="M8 16a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"></path>
                    <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
                    <path d="M8 13V5"></path>
                    <path d="M16 13V5"></path>
                  </svg>
                  Linux
                </Button>
                <Button size="lg" variant="outline" className="gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                  </svg>
                  Web App
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2025 ScreenConnect. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
