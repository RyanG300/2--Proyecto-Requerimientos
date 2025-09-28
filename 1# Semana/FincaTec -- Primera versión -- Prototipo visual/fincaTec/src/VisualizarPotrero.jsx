function VisualizarPotrero() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white py-10">
            <div className="max-w-3xl mx-auto flex flex-col gap-10">
                {/* Rectángulo principal del potrero */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-300 flex flex-row items-center gap-8">
                    <img src="images/Potreros_relleno/potrero_1.png" alt="Potrero La Esperanza" className="w-44 h-44 object-cover rounded-xl border-2 border-green-400" />
                    <div className="flex-1 flex flex-col gap-2">
                        <h2 className="text-3xl font-extrabold text-green-700 mb-2">Potrero La Esperanza</h2>
                        <div className="font-bold text-green-800">Capacidad: <span className="font-normal text-gray-700">30 cabezas</span></div>
                        <div className="font-bold text-green-800">Ubicación:</div>
                        <div className="ml-4 text-gray-700">Alajuela, San Carlos, Quesada, 500m norte de la plaza</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-green-800">Estado:</span>
                            <span className="px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold text-sm flex items-center gap-1">
                                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                                Excelente calidad
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-2xl font-bold text-green-700 text-center">Animales actualmente en el potrero</div>

                {/* Animales asociados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Animal 1 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300 flex flex-col items-center">
                        <img src="images/Ganado_Relleno/toro_1.png" alt="Toro Bravo" className="w-28 h-28 object-cover rounded-lg border border-green-300 mb-3" />
                        <div className="font-bold text-green-800 mb-1">Identificación única: 001</div>
                        <div className="text-sm text-gray-700">Especie: Bovino</div>
                        <div className="text-sm text-gray-700">Raza: Brahman</div>
                        <div className="text-sm text-gray-700">Sexo: Macho</div>
                        <div className="text-sm text-gray-700">Fecha de nacimiento: 2022-03-15</div>
                        <div className="text-sm text-gray-700">Potrero actual: Potrero La Esperanza</div>
                        <div className="text-sm text-gray-700">Peso: 350 kg</div>
                    </div>
                    {/* Animal 2 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300 flex flex-col items-center">
                        <img src="images/Ganado_Relleno/vaca_1.png" alt="Vaca Linda" className="w-28 h-28 object-cover rounded-lg border border-green-300 mb-3" />
                        <div className="font-bold text-green-800 mb-1">Identificación única: 002</div>
                        <div className="text-sm text-gray-700">Especie: Bovino</div>
                        <div className="text-sm text-gray-700">Raza: Holstein</div>
                        <div className="text-sm text-gray-700">Sexo: Hembra</div>
                        <div className="text-sm text-gray-700">Fecha de nacimiento: 2021-08-10</div>
                        <div className="text-sm text-gray-700">Potrero actual: Potrero La Esperanza</div>
                        <div className="text-sm text-gray-700">Peso: 320 kg</div>
                    </div>
                    {/* Animal 3 */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300 flex flex-col items-center">
                        <img src="images/Ganado_Relleno/vaca_2.png" alt="Vaca Serena" className="w-28 h-28 object-cover rounded-lg border border-green-300 mb-3" />
                        <div className="font-bold text-green-800 mb-1">Identificación única: 003</div>
                        <div className="text-sm text-gray-700">Especie: Bovino</div>
                        <div className="text-sm text-gray-700">Raza: Jersey</div>
                        <div className="text-sm text-gray-700">Sexo: Hembra</div>
                        <div className="text-sm text-gray-700">Fecha de nacimiento: 2020-12-22</div>
                        <div className="text-sm text-gray-700">Potrero actual: Potrero La Esperanza</div>
                        <div className="text-sm text-gray-700">Peso: 300 kg</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default VisualizarPotrero