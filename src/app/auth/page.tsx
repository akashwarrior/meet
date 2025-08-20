"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { signIn, signUp } from "@/lib/auth/auth-client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";

export default function Auth() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const name = nameRef.current?.value || "";

    if (isSignUp) {
      if (!name.trim()) return toast.error("Please enter your name");
      if (password.length < 8)
        return toast.error("Password must be at least 8 characters");

      await signUp.email(
        { name, email, password, callbackURL: "/" },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            toast.success("Account created successfully");
            router.back();
          },
          onError: (ctx) => {
            toast.error("Something went wrong", {
              description: ctx.error.message,
            });
            setLoading(false);
          },
        },
      );
    } else {
      await signIn.email(
        { email, password, callbackURL: "/" },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            toast.success("Logged in successfully");
          },
          onError: (ctx) => {
            toast.error("Something went wrong", {
              description: ctx.error.message,
            });
            setLoading(false);
          },
        },
      );
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setShowPassword(false);
    setLoading(false);
    [nameRef, emailRef, passwordRef].forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    if (emailRef.current && passwordRef.current) {
      emailRef.current.value = "guest@example.com";
      passwordRef.current.value = "guest123";
      handleSubmit(e);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted dark:bg-black/50 relative overflow-hidden">
      <div className="absolute w-full h-full overflow-visible z-0 top-0 left-0 origin-center animate-bg-effect">
        <div className="absolute bottom-20 left-20 bg-[#3291ff] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full" />
        <div className="absolute top-20 right-20 bg-[#79ffe1] w-1/2! h-1/2! dark:w-1/6 dark:h-1/6 blur-[250px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-background rounded-lg shadow-lg">
        <AnimatePresence mode="wait">
          <motion.header
            key={isSignUp ? "signup-header" : "signin-header"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp
                ? "Enter your information to get started"
                : "Enter your credentials to access your account"}
            </p>
          </motion.header>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {isSignUp && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  marginBottom: 16,
                  transition: {
                    height: { duration: 0.4, ease: "easeInOut" },
                    opacity: { duration: 0.3, delay: 0.1 },
                    marginBottom: { duration: 0.4, ease: "easeInOut" },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginBottom: 0,
                  transition: {
                    opacity: { duration: 0.2 },
                    height: { duration: 0.3, delay: 0.1, ease: "easeInOut" },
                    marginBottom: {
                      duration: 0.3,
                      delay: 0.1,
                      ease: "easeInOut",
                    },
                  },
                }}
                className="space-y-2 overflow-hidden"
              >
                <Label htmlFor="name">Full Name</Label>
                <Input
                  ref={nameRef}
                  id="name"
                  type="text"
                  maxLength={64}
                  autoComplete="name"
                  placeholder="Full Name"
                  className="h-12"
                  required={isSignUp}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="space-y-2"
            layout
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Label htmlFor="email">Email</Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete={isSignUp ? "email" : "username"}
              className="h-12"
              required
            />
          </motion.div>

          <motion.div
            className="space-y-2"
            layout
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                ref={passwordRef}
                minLength={8}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="h-12 pr-12"
                required
              />
              <Button
                size="sm"
                type="button"
                variant="ghost"
                className="!absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
            </div>

            <AnimatePresence>
              {isSignUp && (
                <motion.p
                  key="password-help"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    transition: {
                      height: { duration: 0.3, ease: "easeInOut" },
                      opacity: { duration: 0.2, delay: 0.1 },
                    },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: {
                      opacity: { duration: 0.15 },
                      height: {
                        duration: 0.25,
                        delay: 0.05,
                        ease: "easeInOut",
                      },
                    },
                  }}
                  className="text-xs text-muted-foreground overflow-hidden"
                >
                  Use 8 or more characters with a mix of letters, numbers &
                  symbols
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }}>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-6"
            >
              <motion.span
                key={isSignUp ? "create-account" : "sign-in"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {loading
                  ? isSignUp
                    ? "Creating account..."
                    : "Signing in..."
                  : isSignUp
                    ? "Create Account"
                    : "Sign In"}
              </motion.span>
            </Button>
          </motion.div>

          <AnimatePresence>
            {!isSignUp && (
              <motion.div
                key="guest-login"
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  transition: {
                    height: { duration: 0.4, ease: "easeInOut" },
                    opacity: { duration: 0.3, delay: 0.15 },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    opacity: { duration: 0.2 },
                    height: { duration: 0.3, delay: 0.1, ease: "easeInOut" },
                  },
                }}
                className="space-y-3 overflow-hidden"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  disabled={loading}
                  onClick={handleGuestLogin}
                >
                  Continue as Guest
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <motion.footer
          className="mt-6 text-center"
          layout
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {isSignUp ? (
              <motion.p
                key="signin-link"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-sm text-muted-foreground"
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium transition-colors duration-200"
                >
                  Sign in
                </button>
              </motion.p>
            ) : (
              <motion.p
                key="signup-link"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-sm text-muted-foreground"
              >
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-primary hover:underline font-medium transition-colors duration-200"
                >
                  Sign up
                </button>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.footer>
      </div>
    </main>
  );
}
