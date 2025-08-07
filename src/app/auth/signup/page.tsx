"use client";

import {
  FormEvent,
  useRef,
  useState,
  unstable_ViewTransition as ViewTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const res = await signIn("newUser", {
      name,
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      toast.success("Account created successfully");
      router.back();
    } else if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <ViewTransition name="credentials">
      <div className="z-10 w-full max-w-[450px] h-[80vh] p-11 rounded-lg bg-background flex flex-col">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 justify-between"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <ViewTransition name="titles">
              <h2 className="text-3xl font-bold tracking-tight">
                Create an account
              </h2>
              <p className="text-muted-foreground">
                Enter your information to get started
              </p>
            </ViewTransition>
          </div>

          <div className="flex flex-col gap-6">
            <Input
              ref={nameRef}
              id="name"
              type="text"
              maxLength={64}
              autoComplete="name"
              placeholder="Full Name"
              className="py-5.5 focus-visible:ring-primary px-4"
              required
            />
            <ViewTransition name="email">
              <Input
                ref={emailRef}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                className="py-5.5 focus-visible:ring-primary px-4"
                required
              />
            </ViewTransition>
            <div className="relative">
              <ViewTransition name="password">
                <Input
                  ref={passwordRef}
                  id="password"
                  minLength={8}
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="py-5.5 focus-visible:ring-primary px-4"
                  required
                />
              </ViewTransition>
              {showPassword ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute! right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(false)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute! right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(true)}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-muted-foreground text-xs mx-1">
              Use 8 or more characters with a mix of letters, numbers & symbols
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              replace={true}
              href="/auth/login"
              className="text-[#1a73e8] hover:text-[#174ea6] font-medium text-sm order-2 sm:order-1"
            >
              Sign in instead
            </Link>

            <Button
              type="submit"
              disabled={loading}
              className="px-6 rounded-md w-full sm:w-auto order-1 sm:order-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </ViewTransition>
  );
}
