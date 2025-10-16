"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Label } from "../components/Label"
import { Checkbox } from "../components/Checkbox"
import styles from "./Login.module.css"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Login attempt:", { email, rememberMe })
    setIsLoading(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Enter your credentials to access your account</p>
        </div>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <Label htmlFor="password">Password</Label>
                <a href="#" className={styles.forgotLink} tabIndex={-1}>
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.rememberRow}>
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className={styles.rememberLabel}>
                Remember me for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className={styles.footer}>
            <span className={styles.footerText}>Don&apos;t have an account? </span>
            <a href="#" className={styles.signupLink}>
              Sign up
            </a>
          </div>
        </div>

        <p className={styles.terms}>
          By continuing, you agree to our{" "}
          <a href="#" className={styles.termsLink}>
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className={styles.termsLink}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
