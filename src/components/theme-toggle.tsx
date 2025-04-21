"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLayoutEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button variant="ghost" className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {mounted ? (theme === "dark" ? <Moon /> : <Sun />) : <Sun />}
    </Button>
  )
}
