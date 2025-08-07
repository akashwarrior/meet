'use client'

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { motion } from "motion/react"

type LoadingDialogProps = {
  open: boolean
  message: string
  subtext?: string
}

export default function LoadingDialog({ open, message, subtext = "This will only take a moment" }: LoadingDialogProps) {
  return (
    <Dialog open={open}>
      <DialogTitle />
      <DialogContent className="sm:max-w-md [&>button]:hidden outline-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full h-full bg-background"
        >
          <div className="flex flex-col items-center justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-medium">{message}</h3>
            <p className="text-gray-500 text-sm mt-2">{subtext}</p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}


