"use client";

import { Appbar } from "@/components/Appbar";
import { ModeToggle } from "@/components/ModeToggle";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HeroVideo } from "@/components/HeroVideo";

export default function Home() {
  const router = useRouter();

  const handleStart = () => router.push("/signup");
  const handleLogin = () => router.push("/login");

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* Background Ambience */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <Appbar />

      <main className="flex-1 flex flex-col items-center relative z-10 w-full">
        {/* Hero Section */}
        <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 border border-secondary text-secondary-foreground text-xs font-medium mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Integrix v2.0 is live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground font-heading max-w-4xl mx-auto leading-[1.1] mb-8"
          >
            Orchestrate your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              digital symphony.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Connect your tools, automate your busywork, and reclaim your creativity.
            Integrix is the modern nervous system for your digital operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={handleStart}
              className="h-14 px-8 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] w-full sm:w-auto"
            >
              Start Building
            </button>
            <button
              onClick={handleLogin}
              className="h-14 px-8 rounded-full border border-border bg-background hover:bg-secondary/40 text-foreground font-medium text-lg transition-all active:scale-95 w-full sm:w-auto"
            >
              View Documentation
            </button>
          </motion.div>
        </section>

        {/* Video Showcase */}
        <section className="w-full max-w-[1400px] mx-auto px-4 md:px-6 mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "circOut" }}
            className="relative rounded-3xl overflow-hidden border border-border/50 bg-card/50 shadow-2xl aspect-[16/9] md:aspect-[21/9]"
          >
            <HeroVideo />
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
          </motion.div>
        </section>

        {/* About Section */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Built for the builders.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Integrix isn't just another automation tool. It's a canvas for your logic.
                We stripped away the clutter and focused on what matters: reliable, fast, and
                secure connections between the apps you use every day.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you are a solo founder synchronizing leads or an enterprise orchestrating
                thousands of events, Integrix scales with your ambition without compromising on
                elegance or usability.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl bg-gradient-to-br from-secondary/50 to-background border border-border overflow-hidden p-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
              <div className="relative z-10 text-center">
                <div className="text-6xl font-heading font-black text-primary/20 select-none">100+</div>
                <div className="text-xl font-medium text-muted-foreground mt-2">Integrations Ready</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Everything you need.</h2>
            <p className="text-muted-foreground text-lg">Powerful primitives to build any workflow you can imagine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Real-time Events"
              description="Triggers fire the moment data changes. No polling intervals, no delays."
              icon={<LightningIcon />}
            />
            <FeatureCard
              title="Visual Builder"
              description="Drag, drop, and connect. Our visual editor makes complex logic intuitive."
              icon={<NetworkIcon />}
            />
            <FeatureCard
              title="Secure Vault"
              description="Credentials are encrypted at rest with AES-256. Your data never leaves our secure enclave."
              icon={<ShieldIcon />}
            />
            <FeatureCard
              title="Infinite History"
              description="Debug with confidence. Retain execution logs indefinitely for audit and replay."
              icon={<HistoryIcon />}
            />
            <FeatureCard
              title="Custom Webhooks"
              description="Connect to any API, even if we don't have a native integration yet."
              icon={<WebhookIcon />}
            />
            <FeatureCard
              title="Team Collaboration"
              description="Share workflows, manage permissions, and build together in real-time."
              icon={<UsersIcon />}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="w-full max-w-5xl mx-auto px-6 py-32 text-center">
          <div className="rounded-3xl bg-secondary/20 border border-border p-12 md:p-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold font-heading mb-8">Ready to automate?</h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
                Join thousands of developers and founders who trust Integrix to run their mission-critical workflows.
              </p>
              <button
                onClick={handleStart}
                className="h-14 px-10 rounded-full bg-foreground text-background font-bold text-lg hover:scale-105 transition-transform"
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </section>

      </main>

      <footer className="w-full border-t border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-muted-foreground font-medium text-sm flex items-center gap-1.5">
            Made with <HeartIcon className="w-4 h-4 text-red-500 fill-red-500" /> by
            <a
              href="https://xyrix.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Bishal Baira
            </a>
          </div>

          <div className="flex items-center gap-6">
            <SocialLink href="https://github.com/bixl007/Integrix" label="GitHub" icon={<GithubIcon />} />
            <SocialLink href="https://linkedin.com/in/bishal-baira" label="LinkedIn" icon={<LinkedinIcon />} />
            <SocialLink href="https://x.com/bixl_007" label="X (Twitter)" icon={<XIcon />} />
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="group p-8 rounded-2xl border border-border bg-card/30 hover:bg-card/80 transition-all hover:border-primary/20 hover:shadow-lg">
      <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-heading mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-secondary/50 rounded-full"
      aria-label={label}
    >
      {icon}
    </a>
  )
}

// Icons
const LightningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
)
const NetworkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></svg>
)
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
)
const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>
)
const WebhookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 1-7.9 5.7c-.8.1-1.1-.9-1.1-1.7V7" /><path d="M8 11V7a6 6 0 0 1 10.4-3.6" /><path d="M10 21a6 6 0 0 1-7.9-5.7c-.8-.1-1.1.9-1.1 1.7v2.3" /></svg>
)
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
)
const HeartIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
)
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
)
const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
)
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
)
