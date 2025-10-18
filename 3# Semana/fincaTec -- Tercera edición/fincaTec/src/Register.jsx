import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const newUser = { name, email, phone, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        //alert("Registration successful!");
        navigate("/company-view");
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Registro</h2>
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
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mt-4"
                >
                    Registrar
                </button>
            </form>
        </div>
    );
}

export default Register;