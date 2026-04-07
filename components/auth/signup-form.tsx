"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
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
import { Eye, EyeOff } from "lucide-react";

const SignupForm = () => {
  const supabase = createClient();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      setError("Username is already taken.");
      setLoading(false);
      return;
    }

    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (!authData?.user?.id) {
      setError("Unexpected error: user not created.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
    });

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login");
  };

  return (
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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your username, email, and password to create your new account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="yourusername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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

          <Button onClick={handleSignup} disabled={loading} className="py-5">
            {loading ? "Creating..." : "Create Account"}
          </Button>

          <p className="text-center">
            Already have an account?{" "}
            <span>
              <Link href="/login">Login</Link>
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
