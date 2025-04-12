import Link from "next/link"
import { ArrowRight, Cast, Lock, MessageSquare, Monitor, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-background/60 backdrop-blur px-6 justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Monitor className="h-6 w-6 text-primary" />
          <span>RemoteShare</span>
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
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 px-6 md:px-8 grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 max-w-7xl mx-auto">
          <div className="flex flex-col justify-center space-y-16">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Secure Screen Sharing
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Connect securely with end-to-end encryption. Share your screen, transfer files, and chat in a single frame with just a few clicks.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
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
          <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
              <Cast className="h-16 w-16 text-primary/80" />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 px-4 md:px-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Powerful Features</h2>
            <p className="text-muted-foreground text-base/relaxed">
              Everything you need for seamless remote connections and collaboration
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-primary/10 hover:border-primary/30 transition-colors">
              <CardHeader>
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
              <CardHeader>
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
              <CardHeader>
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
              <CardHeader>
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
              <CardHeader>
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
              <CardHeader>
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
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 px-4 md:px-6">
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
        </section>

        <section id="security" className="py-12 md:py-24 lg:py-32 bg-muted/50 px-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto justify-between">
            <div className="flex flex-col justify-center space-y-8 max-w-2xl lg:max-w-xl">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Security First Approach</h2>
                <p className="text-muted-foreground text-base/relaxed">
                  Your privacy and security are our top priorities. We implement industry-leading security measures to
                  protect your data and connections.
                </p>
              </div>
              <ul className="grid gap-2 leading-relaxed">
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
            <div className="relative w-full max-w-lg aspect-square rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
                <div className="p-8 rounded-full bg-background/80 backdrop-blur-sm">
                  <Shield className="h-20 w-20 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 px-4 md:px-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Get Started Today</h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Login to your account or create a new one to start sharing your screen securely and easily.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </section>
      </main>
      <footer className="w-full border-t px-4 py-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">©{new Date().getFullYear()} RemoteShare. No rights reserved.</p>
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
      </footer>
    </div>
  );
}
