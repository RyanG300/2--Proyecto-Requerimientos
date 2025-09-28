
function AddGanado() {
    return (
        <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
            <h2 className="text-2xl font-bold text-green-700 mb-6">Añadir cabeza de ganado</h2>
            <form className="flex flex-col gap-4">
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Identificación única (arete/código)</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: 12345" />
                </div>
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Especie</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: Bovino" />
                </div>
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Raza</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: Brahman" />
                </div>
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Sexo</label>
                    <select className="w-full border rounded-lg px-3 py-2 outline-none">
                        <option value="">Selecciona</option>
                        <option value="Macho">Macho</option>
                        <option value="Hembra">Hembra</option>
                    </select>
                </div>
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Fecha de nacimiento</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 outline-none" />
                </div>
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Potrero actual</label>
                    <input type="text" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: Potrero La Esperanza" />
                </div>
                <div>
                    <label className="block font-semibold text-green-800 mb-1">Peso (kg)</label>
                    <input type="number" className="w-full border rounded-lg px-3 py-2 outline-none" placeholder="Ej: 350" />
                </div>
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition mt-4">Guardar</button>
            </form>
        </div>
    )
}

export default AddGanado
        
            