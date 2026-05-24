"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Zap, Sparkles, Calendar, BarChart3, ArrowRight, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Sparkles,
    title: "AI Content Engine",
    description: "Generate tweet ideas and drafts using free AI models. Maintains your authentic voice with persona memory.",
    gradient: "from-accent-blue to-accent-purple",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Visual content calendar with drag-and-drop. Best-time suggestions and randomized posting delays.",
    gradient: "from-accent-purple to-accent-rose",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description: "Track engagement, discover top-performing content, and get AI-powered improvement recommendations.",
    gradient: "from-accent-green to-accent-cyan",
  },
];

const stats = [
  { label: "Free Forever", value: "$0" },
  { label: "AI Models", value: "2+" },
  { label: "No API Keys", value: "✓" },
  { label: "Open Source", value: "100%" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[800px] w-[800px] rounded-full bg-accent-blue/[0.07] blur-[120px]" />
        <div className="absolute -top-[20%] -right-[20%] h-[600px] w-[600px] rounded-full bg-accent-purple/[0.07] blur-[120px]" />
        <div className="absolute -bottom-[30%] left-[30%] h-[700px] w-[700px] rounded-full bg-accent-rose/[0.04] blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-text-primary">Xautomation</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/overview">
            <Button size="sm">Go to Dashboard</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center pt-20 pb-16 text-center md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-purple/20 bg-accent-purple/5 px-4 py-1.5 text-sm text-accent-purple"
          >
            <Bot className="h-4 w-4" />
            <span>AI-powered • Human-in-the-loop • 100% Free</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl"
          >
            Your AI content engine for{" "}
            <span className="gradient-text">X/Twitter</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-text-secondary md:text-xl"
          >
            Generate ideas, craft authentic drafts, and schedule posts — all powered by free AI.
            Built for developers and tech creators who want to grow on X without sounding like a bot.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Link href="/overview">
              <Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-12"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-text-primary md:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Features */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">Everything you need to grow on X</h2>
            <p className="mt-4 text-text-secondary">No spam bots. No cringe AI. Just authentic content at scale.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass group relative rounded-2xl p-6 transition-all duration-300 hover:border-white/10"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Human-in-the-loop callout */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-20 max-w-3xl text-center"
        >
          <div className="glass rounded-2xl p-8 md:p-12">
            <Shield className="mx-auto mb-4 h-10 w-10 text-accent-green" />
            <h3 className="mb-3 text-2xl font-bold">Human-in-the-Loop</h3>
            <p className="text-text-secondary">
              Nothing posts without your approval. AI generates → you review & edit → you approve → system posts.
              Your voice. Your control. Always.
            </p>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-border-default py-8 text-center text-sm text-text-tertiary">
          <p>Built with ♥ using Next.js, Gemini, and zero paid APIs.</p>
        </footer>
      </main>
    </div>
  );
}
