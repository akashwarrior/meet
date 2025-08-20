"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { Video, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-background min-h-screen relative">
      <Header />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative mb-8">
            <div className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-6 animate-pulse">
                <Video className="h-11 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Route Not Found
            </h1>

            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              The route you're looking for doesn't exist. Let's get you back to
              connecting with others.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/" prefetch={false}>
                <Button className="w-full sm:w-auto px-6 py-3 rounded-md">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full sm:w-auto px-6 py-3 rounded-md"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </main>
  );
}
