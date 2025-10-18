import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(
                (u) => u.email === email && u.password === password
            );

            if (user) {
                // Usar el contexto para hacer login
                const loginSuccess = login(user);
                if (loginSuccess) {
                    navigate("/company-view");
                } else {
                    alert("Error al iniciar sesión. Intente nuevamente.");
                }
            } else {
                alert("Correo o contraseña incorrectos.");
            }
        } catch (error) {
            console.error("Error durante el login:", error);
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
            </form>
        </div>
    );
}

export default Login;