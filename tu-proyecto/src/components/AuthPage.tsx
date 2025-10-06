import React, { useState } from "react";

interface AuthPageProps {
  onLoginComplete: (data: UserData) => void;
  onRegisterClick: () => void;
}

interface LoginData {
  email: string;
  password: string;
}

interface UserData {
  nombre: string;
  correo: string;
  contrasena: string;
}

export default function AuthPage({ onLoginComplete, onRegisterClick }: AuthPageProps) {
  const [mode, setMode] = useState<"inicio" | "login">("inicio");
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [mensaje, setMensaje] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:8000/usuarios/buscar_por_correo?correo=${loginData.email}`);
      if (!res.ok) throw new Error("Usuario no encontrado");
      const user: UserData = await res.json();

      if (user.contrasena !== loginData.password) {
        setMensaje("Contraseña incorrecta");
      } else {
        setMensaje(`¡Bienvenido, ${user.nombre}!`);
        localStorage.setItem("user", JSON.stringify(user));
        onLoginComplete(user); // Callback al App.tsx
      }
    } catch (error: any) {
      setMensaje(error.message);
    }
  };

  if (mode === "inicio") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-green-200 p-4">
        <h1 className="text-4xl font-extrabold text-black mb-8">
          Bio<span className="text-emerald-600">Space</span> Portal
        </h1>
        <div className="flex gap-6">
          <button
            onClick={() => setMode("login")}
            className="px-8 py-4 rounded-xl bg-black text-white hover:bg-emerald-700 font-semibold"
          >
            Login
          </button>
          <button
            onClick={onRegisterClick} // Va a WelcomeScreen
            className="px-8 py-4 rounded-xl bg-white border border-black/20 hover:bg-emerald-100 font-semibold"
          >
            Registrarse
          </button>
        </div>
      </div>
    );
  }

  if (mode === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-green-200 p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl border border-black/20 shadow-xl p-8 grid gap-5"
        >
          <h2 className="text-2xl font-bold text-center text-black mb-4">Login</h2>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            className="w-full p-3 rounded-xl border border-black/30 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            className="w-full p-3 rounded-xl border border-black/30 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-black text-white hover:bg-emerald-700 font-semibold"
          >
            Ingresar
          </button>
          <p className="text-center text-red-600">{mensaje}</p>
          <p
            className="text-center text-sm text-black/70 cursor-pointer hover:underline"
            onClick={() => setMode("inicio")}
          >
            Volver
          </p>
        </form>
      </div>
    );
  }

  return null;
}
