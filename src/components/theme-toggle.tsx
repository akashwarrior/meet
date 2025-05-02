"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { LazyMotion } from "motion/react"
import * as motion from "motion/react-m"
import { Button } from "./ui/button"

const loadFeatures = () => import("@/components/domAnimation").then(res => res.default)

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && (
    <LazyMotion features={loadFeatures}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <Button variant="ghost" className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Moon /> : <Sun />}
        </Button>
      </motion.div>
    </LazyMotion>
  )
}
