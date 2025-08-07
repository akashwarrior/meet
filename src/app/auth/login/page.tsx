"use client";

import { toast } from "sonner";
import {
  FormEvent,
  useRef,
  useState,
  unstable_ViewTransition as ViewTransition,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    setLoading(true);
    try {
      const res = await signIn("Login", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        toast.success("Login successful");
        router.back();
      } else {
        if (res?.error) {
          toast.error(res.error, {
            description: "Please check your credentials and try again",
          });
        } else {
          toast.error("Something went wrong", {
            description: "Please try again later",
          });
        }
        setLoading(false);
      }
    } catch (error) {
      console.log("Error during login:", error);
    }
  };

  return (
    <ViewTransition name="credentials">
      <div className="z-10 w-full max-w-[450px] min-h-[85vh] p-11 rounded-lg bg-background flex flex-col justify-between">
        <div className="flex flex-col items-center gap-3 text-center">
          <ViewTransition name="titles">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </ViewTransition>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-10 mb-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>

            <ViewTransition name="email">
              <Input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="name@example.com"
                className="py-5.5 focus-visible:ring-primary px-4"
                required
              />
            </ViewTransition>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <ViewTransition name="password">
                <Input
                  ref={passwordRef}
                  minLength={8}
                  id="password"
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
          </div>
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-5.5 rounded-full text-base"
            >
              {loading ? "Loading..." : "Login"}
            </Button>
            <div className="flex items-center justify-center">
              <hr className="w-full border-t border-border" />
              <span className="mx-4 text-muted-foreground text-sm">or</span>
              <hr className="w-full border-t border-border" />
            </div>
            <Button
              type="submit"
              variant="ghost"
              className="w-full py-5.5 rounded-full border dark:border-white/50 text-black/80 dark:text-white"
              disabled={loading}
              onClick={(e) => {
                if (!emailRef.current || !passwordRef.current) return;
                emailRef.current.value = "guest@example.com";
                passwordRef.current.value = "guest123";
                handleLogin(e);
              }}
            >
              Continue as Guest
            </Button>
          </div>
        </form>

        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            replace={true}
            href="/auth/signup"
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </ViewTransition>
  );
}
