import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(
            (u) => u.email === email && u.password === password
        );

        if (user) {
            //alert("Login successful!");
            navigate("/company-view");
        } else {
            alert("Invalid email or password.");
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
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mt-4"
                >
                    Iniciar sesión
                </button>
            </form>
        </div>
    );
}

export default Login;