import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  phrases: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  loop?: boolean
  className?: string
}

export default function TypewriterText({
  phrases,
  typingSpeed = 55,
  deletingSpeed = 35,
  pauseDuration = 2000,
  loop = true,
  className = '',
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCaret, setShowCaret] = useState(true)

  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (prefersReducedMotion) {
      // Show the final phrase immediately without animation
      setDisplayedText(phrases[0])
      return
    }

    const currentPhrase = phrases[phraseIndex]
    let timeout: NodeJS.Timeout

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1))
        }, typingSpeed)
      } else {
        // Finished typing, pause before deleting
        timeout = setTimeout(() => {
          if (loop && phrases.length > 1) {
            setIsDeleting(true)
          }
        }, pauseDuration)
      }
    } else {
      // Deleting phase
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, deletingSpeed)
      } else {
        // Move to next phrase
        setIsDeleting(false)
        setPhraseIndex((prev) => (prev + 1) % phrases.length)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayedText, phraseIndex, isDeleting, phrases, typingSpeed, deletingSpeed, pauseDuration, loop, prefersReducedMotion])

  // Blinking caret effect
  useEffect(() => {
    const caretInterval = setInterval(() => {
      setShowCaret((prev) => !prev)
    }, 500)

    return () => clearInterval(caretInterval)
  }, [])

  return (
    <span className={className}>
      {displayedText}
      <span className={`${showCaret ? 'opacity-100' : 'opacity-0'} ml-1 inline-block h-[1em] w-0.5 bg-violet-300 transition-opacity duration-100`} />
    </span>
  )
}
