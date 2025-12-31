'use client'

import { useEffect, useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface RollingTextProps {
  words: string[]
  interval?: number
  className?: string
}

export function RollingText({ words, interval = 2500, className = '' }: RollingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Find the longest word to reserve space
  const longestWord = useMemo(() => {
    return words.reduce((a, b) => (a.length > b.length ? a : b), '')
  }, [words])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  return (
    <span className={`inline-flex relative ${className}`}>
      {/* Invisible text to reserve width for longest word */}
      <span className="invisible whitespace-nowrap">{longestWord}</span>

      {/* Animated text positioned absolutely, left-aligned */}
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{
            rotateX: -90,
            opacity: 0,
            y: 20
          }}
          animate={{
            rotateX: 0,
            opacity: 1,
            y: 0
          }}
          exit={{
            rotateX: 90,
            opacity: 0,
            y: -20
          }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="absolute left-0 top-0 origin-bottom whitespace-nowrap"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
          }}
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
