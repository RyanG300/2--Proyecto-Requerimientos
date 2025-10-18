// src/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("finquero"); // <-- NUEVO
    const navigate = useNavigate();
    const { login } = useUser(); // <-- para auto-login

    const handleRegister = (e) => {
        e.preventDefault();

        const users = JSON.parse(localStorage.getItem("users")) || [];
        // evitamos correos duplicados (opcional)
        if (users.some(u => u.email === email)) {
            alert("Este correo ya está registrado.");
            return;
        }

        const newUser = {
            name,
            email,
            phone,
            password,
            role,              // <-- guardamos el rol
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        // Auto-login usando tu UserContext (usa la clave 'loggedUser')
        login(newUser);

        // Redirigir según rol
        if (role === "veterinario") {
            navigate("/perfil-veterinario");
        } else {
            navigate("/company-view");
        }
    };

    const roleBtn = (value, label) => (
        <button
            type="button"
            onClick={() => setRole(value)}
            className={`px-4 py-2 rounded-lg border transition ${role === value
                ? "bg-green-600 text-white border-green-700"
                : "bg-white text-green-700 border-green-400 hover:border-green-600"
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Registro</h2>

            {/* Selector de rol */}
            <div className="mb-4">
                <p className="block font-semibold text-green-800 mb-2">Tipo de usuario</p>
                <div className="flex gap-3">
                    {roleBtn("finquero", "Finquero")}
                    {roleBtn("veterinario", "Veterinario")}
                </div>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <label className="block font-semibold text-green-800 mb-1">Nombre</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none"
                    placeholder="Ingrese su nombre"
                    required
                />

                <label className="block font-semibold text-green-800 mb-1">Correo</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none"
                    placeholder="Ingrese su correo"
                    required
                />

                <label className="block font-semibold text-green-800 mb-1">Teléfono</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 outline-none"
                    placeholder="Ingrese su número de teléfono"
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
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mt-2"
                >
                    Registrar
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

export default Register;
