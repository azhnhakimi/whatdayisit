"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginForm = () => {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Failed to log in. No session returned.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/modules/calendar");
  };

  return (
    <>
      <Card className="w-full max-w-sm mx-auto mt-20 py-8">
        <CardHeader>
          <div className="flex flex-col justify-center items-center mb-6">
            <Image
              src="/icons/app-icon.png"
              alt="Description of the image"
              width={150}
              height={150}
            />
            <p className="text-lg font-bold text-black">What Day Is It?</p>
          </div>
          <CardTitle>Log in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="yourpassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleLogin} disabled={loading} className="py-5">
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <p className="text-center">
              Don't have an account?{" "}
              <span>
                <Link href="/signup">Signup</Link>
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default LoginForm;
