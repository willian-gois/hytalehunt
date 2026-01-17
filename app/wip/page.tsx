"use client"

import Link from "next/link"

import { ArrowRight, Hammer, Home } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"

export default function WIPPage() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background px-4 py-24">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex max-w-2xl flex-col items-center text-center"
      >
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Hammer className="h-10 w-10" />
        </div>

        <h1 className="font-heading mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
          Work In Progress
        </h1>

        <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
          We&apos;re currently building something amazing. This page is under construction, but you
          can still explore the rest of HytaleHunt.
        </p>
      </motion.div>

      {/* Animated progress bar simulation */}
      <div className="mt-16 w-full max-w-md">
        <div className="mb-2 flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">Development Progress</span>
          <span className="text-primary">85%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "85%" }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
      </div>
    </div>
  )
}
