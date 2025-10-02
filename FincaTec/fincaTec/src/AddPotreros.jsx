import { useState } from "react";
import { provincias } from "./data";

function AddPotreros() {
    const [fotoUrl, setFotoUrl] = useState(null);

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFotoUrl(URL.createObjectURL(file));
        } else {
            setFotoUrl(null);
        }
    };

    return (
        <>
            <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
                <h2 className="text-2xl font-bold text-green-700 mb-6">Añadir potreros</h2>
                <form className="flex flex-col gap-4">
                    {/* ...existing code... */}
                    <label className="block font-semibold text-green-800 mb-1">Capacidad del potrero</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: 50 cabezas de ganado" />
                    {/* Selección de provincia y cantón */}
                    <label className="block font-semibold text-green-800 mb-1">Ubicación</label>
                    <div className="flex gap-2"> 
                        <select className="w-1/2 border rounded-lg px-3 py-2 outline-none">
                            <option value="">Provincia</option>
                            {provincias.map((provincia) => (
                                <option key={provincia.id} value={provincia.nombre}>{provincia.nombre}</option>
                            ))}
                        </select>
                        <select className="w-1/2 border rounded-lg px-3 py-2 outline-none">
                            <option value="">Cantón</option>
                            {provincias.flatMap((provincia) => provincia.cantones).map((canton, index) => (
                                <option key={index} value={canton}>{canton}</option>
                            ))}
                        </select>
                    </div>
                    <label className="block font-semibold text-green-800 mb-1">Dirección exacta</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: 500 metros al este de la iglesia, distrito X" />
                    {/* Foto */}
                    <div>
                        <label className="block font-semibold text-green-800 mb-1">Foto del potrero (opcional)</label>
                        <input type="file" className="w-full border rounded-lg px-3 py-2 outline-none" accept="image/*" onChange={handleFotoChange} />
                        <img src={fotoUrl || "https://via.placeholder.com/150"} alt="Foto del potrero" className="mt-2 w-32 h-32 object-cover rounded-lg border" />
                    </div>
                    {/* Estado */}
                    <label className="block font-semibold text-green-800 mb-1">Estado</label>
                    <select className="w-full border rounded-lg px-3 py-2 outline-none">
                        <option value="">Selecciona</option>
                        <option value="Buen estado">Buen estado</option>
                        <option value="Estado decente">Estado decente</option>
                        <option value="Decadente">Decadente</option>
                    </select>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mt-4">Guardar</button>
                </form>
            </div>
        </>
    );
}

export default AddPotreros
