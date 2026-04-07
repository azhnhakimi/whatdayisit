import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";
import LineWaves from "@/components/LineWaves";

export const metadata: Metadata = {
  title: "Login",
};

const Login = () => {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#121212]">
      <div className="absolute inset-0 z-0 w-full h-full">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1}
          rotation={-45}
          edgeFadeWidth={0}
          colorCycleSpeed={1}
          brightness={0.2}
          color1="#ffffff"
          color2="#ffffff"
          color3="#ffffff"
          enableMouseInteraction
          mouseInfluence={2}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center pointer-events-auto">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
