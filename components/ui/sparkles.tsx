"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface SparklesProps {
  className?: string
  color?: string
  density?: number
  speed?: number
  size?: number
  opacity?: number
  background?: string
}

export function Sparkles({
  className,
  color = "#20659C",
  density = 80,
  speed = 1,
  opacity = 0.7,
  background = "transparent",
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particles: Array<{
      x: number; y: number; vx: number; vy: number
      size: number; alpha: number; decay: number
    }> = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const spawn = () => {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed - 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * opacity,
        decay: Math.random() * 0.008 + 0.003,
      })
    }

    for (let i = 0; i < density; i++) spawn()

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (particles.length < density) spawn()
      particles = particles.filter(p => p.alpha > 0)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = color
        ctx.shadowBlur = 4
        ctx.shadowColor = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      animationId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [color, density, speed, opacity])

  return (
    <canvas
      ref={canvasRef}
      style={{ background }}
      className={cn("w-full h-full", className)}
    />
  )
}

export default Sparkles
