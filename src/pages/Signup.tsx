"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const Signup = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Criar conta</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          view="sign_up"
        />
        <p className="mt-4 text-center text-sm">
          Já tem conta?{" "}
          <a href="/login" className="text-primary underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;