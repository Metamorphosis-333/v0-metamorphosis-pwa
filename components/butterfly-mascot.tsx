"use client"

import styles from "./butterfly-mascot.module.css"

export function ButterflyMascot() {
  return (
    <div className={styles.container}>
      <svg viewBox="0 0 100 100" className={styles.butterfly}>
        {/* Left Wing */}
        <ellipse cx="35" cy="40" rx="25" ry="35" className={styles.wingLeft} fill="url(#wingGradient)" opacity="0.9" />

        {/* Right Wing */}
        <ellipse cx="65" cy="40" rx="25" ry="35" className={styles.wingRight} fill="url(#wingGradient)" opacity="0.9" />

        {/* Body */}
        <ellipse cx="50" cy="50" rx="8" ry="28" fill="#2d3748" />

        {/* Head */}
        <circle cx="50" cy="25" r="8" fill="#2d3748" />

        {/* Antennae */}
        <line x1="48" y1="18" x2="42" y2="8" stroke="#4299e1" strokeWidth="1.5" />
        <line x1="52" y1="18" x2="58" y2="8" stroke="#4299e1" strokeWidth="1.5" />

        {/* Eyes */}
        <circle cx="48" cy="24" r="1.5" fill="#ffd700" />
        <circle cx="52" cy="24" r="1.5" fill="#ffd700" />

        {/* Wing Details */}
        <defs>
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#667eea" />
            <stop offset="100%" stopColor="#764ba2" />
          </linearGradient>
        </defs>

        <circle cx="35" cy="35" r="4" fill="rgba(255, 255, 255, 0.3)" />
        <circle cx="65" cy="35" r="4" fill="rgba(255, 255, 255, 0.3)" />
      </svg>
    </div>
  )
}
