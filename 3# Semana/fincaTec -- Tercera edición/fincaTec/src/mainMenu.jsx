import React from 'react'
import { motion } from 'framer-motion'

// Componente de landing/reinicio visual para FincaTec
// Usa Tailwind CSS (asegúrate de tener Tailwind + Framer Motion instalados en tu proyecto)
// Exporta un componente que acepta opcionalmente props onLogin y onSignup

export default function FincaTecLanding({ onLogin, onSignup }) {
  const handleLogin = () => {
    if (onLogin) return onLogin()
    window.location.href = '/login'
  }
  const handleSignup = () => {
    if (onSignup) return onSignup()
    window.location.href = '/register'
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center p-6">
      {/* Contenedor principal */}
      <div className="w-full max-w-6xl">
        {/* Top nav / logo */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <img
              src="/images/Menu_finqueros/icono_FincaTec.png"
              alt="Logo de FincaTec"
              className="w-14 h-14 rounded-lg shadow-md bg-white/60 p-1"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-green-800 leading-tight">FincaTec</h1>
              <p className="text-sm text-green-600 -mt-1">Tu aliado en la gestión ganadera</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="hidden sm:inline-block bg-white border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition"
            >
              Iniciar sesión
            </button>
            <button
              onClick={handleSignup}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              Regístrate
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
              <h2 className="text-4xl md:text-5xl font-extrabold text-green-800">Gestiona tu finca con calma y precisión</h2>
              <p className="mt-4 text-lg text-green-700 max-w-xl">
                FincaTec centraliza el control de tu ganado, potreros y actividades diarias. Registra, analiza y actúa desde una sola plataforma pensada
                para productores como tú.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleSignup}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform hover:-translate-y-0.5 transition"
                >
                  Regístrate y comienza
                </button>
                <button
                  onClick={handleLogin}
                  className="bg-white border border-green-200 text-green-700 px-5 py-3 rounded-lg shadow-sm hover:shadow-md"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <FeatureBadge title="Control de grupos" subtitle="Potreros y pastoreo" />
                <FeatureBadge title="Historial" subtitle="Registro animal" />
                <FeatureBadge title="Alertas" subtitle="Recordatorios" />
                <FeatureBadge title="Reportes" subtitle="Toma decisiones" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Tarjeta ilustrativa */}
              <div className="absolute -left-8 -top-8 rounded-lg p-3 bg-white/70 shadow-lg">
                <MiniStat label="200+" text="Animales" />
              </div>

              <div className="bg-gradient-to-br from-green-200 to-white rounded-2xl p-6 shadow-xl">
                {/* Simple ilustración SVG representativa */}
                {/*<FarmIllustration />*/ }
                <img src="/images/Main_Menu/vaca.png" alt="Ilustración de finca" className="w-full h-80 object-cover rounded-lg" />
              </div>

              <div className="absolute -right-6 -bottom-6 rounded-lg p-3 bg-white/70 shadow-lg">
                <MiniStat label="98%" text="Satisfacción" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features / cards */}
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard
            title="Rápido registro"
            desc="Agrega animales y eventos en segundos con formularios optimizados."
            icon={IconClipboard}
          />
          <FeatureCard
            title="Trazabilidad"
            desc="Sigue el historial de cada animal, vacunaciones y movimientos."
            icon={IconMap}
          />
          <FeatureCard
            title="Decisiones con datos"
            desc="Reportes claros para planear pastoreo, alimentación y reproducción."
            icon={IconChart}
          />
        </section>

        {/* Footer */}
        <footer className="mt-14 py-8 text-center text-sm text-green-700">
          <p>© 2025 FincaTec. All rights reserved.</p>
        </footer>
      </div>
    </main>
  )
}

/* ---------- Small UI pieces (internal components) ---------- */
function FeatureBadge({ title, subtitle }) {
  return (
    <div className="flex items-start gap-3 bg-white/40 p-3 rounded-lg">
      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12h14" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 6h14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold text-green-800">{title}</div>
        <div className="text-xs text-green-700">{subtitle}</div>
      </div>
    </div>
  )
}

function MiniStat({ label, text }) {
  return (
    <div className="text-center">
      <div className="text-lg font-extrabold text-green-800">{label}</div>
      <div className="text-xs text-green-700">{text}</div>
    </div>
  )
}

function FeatureCard({ title, desc, icon: Icon }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-md">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white shadow-sm">
          <Icon />
        </div>
        <div>
          <h3 className="font-bold text-green-800">{title}</h3>
          <p className="text-sm text-green-700 mt-2">{desc}</p>
        </div>
      </div>
    </motion.article>
  )
}

/* ---------- Icons (simple inline SVG React components) ---------- */
function IconClipboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="2" width="6" height="4" rx="1" stroke="#166534" strokeWidth="1.5" />
      <rect x="4" y="7" width="16" height="13" rx="2" stroke="#16a34a" strokeWidth="1.5" />
    </svg>
  )
}
function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6l6-2v14l-6 2V6z" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 8l6-2v14L3 20V8z" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3v18h18" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13v-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13v-8" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 13v-2" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---------- Simple farm illustration (SVG) ---------- */
/*
function FarmIllustration() {
  return (
    <svg viewBox="0 0 600 400" className="w-full h-64" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="20" fill="url(#g)" />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {/* Barn }
      <g transform="translate(60,90)">
        <rect x="0" y="40" width="160" height="90" rx="6" fill="#f97316" />
        <polygon points="0,40 80,0 160,40" fill="#ea580c" />
        <rect x="60" y="70" width="40" height="60" fill="#7c3aed" />
      </g>
      {/* Cow simple }
      <g transform="translate(300,170)">
        <ellipse cx="0" cy="0" rx="50" ry="30" fill="#fff" stroke="#111827" />
        <circle cx="-15" cy="-8" r="6" fill="#111827" />
        <circle cx="10" cy="-8" r="6" fill="#111827" />
      </g>
      {/* Trees }
      <g transform="translate(450,80)">
        <circle cx="0" cy="0" r="28" fill="#16a34a" />
        <rect x="-6" y="18" width="12" height="28" fill="#8b5e3c" />
      </g>
    </svg>
  )
}
*/