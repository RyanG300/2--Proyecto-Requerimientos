// src/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, login } = useUser();

    // Si ya hay sesión, redirige según rol
    useEffect(() => {
        if (!user) return;
        const role = user.role || "finquero";
        navigate(role === "veterinario" ? "/perfil-veterinario" : "/company-view", { replace: true });
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const normalizedEmail = email.trim().toLowerCase();

            const found = users.find(
                (u) => (u.email || "").trim().toLowerCase() === normalizedEmail && u.password === password
            );

            if (!found) {
                alert("Correo o contraseña incorrectos.");
                return;
            }

            const loginSuccess = login(found); // guarda en contexto/localStorage
            if (!loginSuccess) {
                alert("Error al iniciar sesión. Intente nuevamente.");
                return;
            }

            const role = found.role || "finquero";
            navigate(role === "veterinario" ? "/perfil-veterinario" : "/company-view");
        } catch (err) {
            console.error("Error durante el login:", err);
            alert("Error al iniciar sesión. Intente nuevamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Inicio de sesión</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <label className="block font-semibold text-green-800 mb-1">Correo</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none"
                    placeholder="Ingrese su correo"
                    required
                />

                <label className="block font-semibold text-green-800 mb-1">Contraseña</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none"
                    placeholder="Ingrese su contraseña"
                    required
                />

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>


                <button
                    type="button"
                    onClick={() => navigate("/menu")}
                    className="mt-3 w-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                >
                    ⬅️ Volver al menú
                </button>

            </form>
        </div>
    );
}

export default Login;
