import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function VisualizarPotrero() {
    const { potreroId } = useParams();
    const navigate = useNavigate();
    const { 
        getPotreroById, 
        getCompanyGroups, 
        getCompanyLivestock,
        assignGroupToPotrero, 
        removeGroupFromPotrero 
    } = useUser();
    
    const [potrero, setPotrero] = useState(null);
    const [gruposDisponibles, setGruposDisponibles] = useState([]);
    const [gruposAsignados, setGruposAsignados] = useState([]);
    const [animalesEnPotrero, setAnimalesEnPotrero] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(true);

    // Cargar datos del potrero y grupos
    useEffect(() => {
        const cargarDatos = () => {
            const potreroData = getPotreroById(potreroId);
            if (!potreroData) {
                alert('Potrero no encontrado');
                navigate('/App');
                return;
            }

            const todosLosGrupos = getCompanyGroups();
            const todosLosAnimales = getCompanyLivestock();

            // Grupos asignados a este potrero
            const asignados = todosLosGrupos.filter(grupo => 
                potreroData.gruposAsignados.includes(grupo.id)
            );

            // Grupos disponibles (no asignados a este potrero)
            const disponibles = todosLosGrupos.filter(grupo => 
                !potreroData.gruposAsignados.includes(grupo.id)
            );

            // Animales que están en grupos asignados a este potrero
            const animales = todosLosAnimales.filter(animal => {
                return asignados.some(grupo => grupo.miembros.includes(animal.identificacion || animal.id));
            });

            setPotrero(potreroData);
            setGruposAsignados(asignados);
            setGruposDisponibles(disponibles);
            setAnimalesEnPotrero(animales);
            setLoading(false);
        };

        cargarDatos();
    }, [potreroId, getPotreroById, getCompanyGroups, getCompanyLivestock, navigate]);

    const handleAsignarGrupo = () => {
        if (!selectedGroup) {
            alert('Por favor selecciona un grupo');
            return;
        }

        const result = assignGroupToPotrero(potreroId, selectedGroup);
        if (result.success) {
            alert('Grupo asignado exitosamente');
            setSelectedGroup('');
            // Recargar datos
            window.location.reload();
        } else {
            alert(result.error);
        }
    };

    const handleRemoverGrupo = (grupoId) => {
        if (window.confirm('¿Estás seguro de que quieres remover este grupo del potrero?')) {
            const result = removeGroupFromPotrero(potreroId, grupoId);
            if (result.success) {
                alert('Grupo removido exitosamente');
                // Recargar datos
                window.location.reload();
            } else {
                alert(result.error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600">Cargando datos del potrero...</div>
            </div>
        );
    }

    if (!potrero) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-red-600">Potrero no encontrado</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white py-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Header con botón de volver */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-green-700">Gestión de Potrero</h1>
                    <button
                        onClick={() => navigate('/App')}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                    >
                        Volver al Menú Principal
                    </button>
                </div>

                {/* Información del potrero */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-300 flex flex-row items-center gap-8">
                    <img 
                        src={potrero.foto || "/images/Potreros_relleno/potrero_1.png"} 
                        alt={potrero.nombre} 
                        className="w-44 h-44 object-cover rounded-xl border-2 border-green-400"
                        onError={(e) => { e.target.src = "/images/Potreros_relleno/potrero_1.png"; }}
                    />
                    <div className="flex-1 flex flex-col gap-2">
                        <h2 className="text-3xl font-extrabold text-green-700 mb-2">{potrero.nombre}</h2>
                        <div className="font-bold text-green-800">
                            Capacidad: <span className="font-normal text-gray-700">{potrero.capacidad} cabezas</span>
                        </div>
                        <div className="font-bold text-green-800">
                            Ocupación actual: <span className="font-normal text-gray-700">{potrero.ocupacionActual}/{potrero.capacidad} cabezas</span>
                        </div>
                        <div className="font-bold text-green-800">Ubicación:</div>
                        <div className="ml-4 text-gray-700">{potrero.provincia}, {potrero.canton}</div>
                        <div className="ml-4 text-gray-700">{potrero.direccion}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="font-bold text-green-800">Estado:</span>
                            <span className={`px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-1 ${
                                potrero.estado === 'Excelente calidad' ? 'bg-green-200 text-green-900' :
                                potrero.estado === 'Buen estado' ? 'bg-blue-200 text-blue-900' :
                                potrero.estado === 'Estado decente' ? 'bg-yellow-200 text-yellow-900' :
                                'bg-red-200 text-red-900'
                            }`}>
                                <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                                {potrero.estado}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sección de asignación de grupos */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300">
                    <h3 className="text-xl font-bold text-green-700 mb-4">Asignar Grupo de Pastoreo</h3>
                    
                    {gruposDisponibles.length === 0 ? (
                        <p className="text-gray-600">No hay grupos disponibles para asignar a este potrero.</p>
                    ) : (
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block font-semibold text-green-800 mb-2">Seleccionar Grupo:</label>
                                <select 
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                >
                                    <option value="">-- Selecciona un grupo --</option>
                                    {gruposDisponibles.map(grupo => (
                                        <option key={grupo.id} value={grupo.id}>
                                            {grupo.id} - {grupo.especie} ({grupo.miembros.length} animales)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAsignarGrupo}
                                disabled={!selectedGroup}
                                className={`px-6 py-2 rounded-lg font-semibold shadow transition ${
                                    selectedGroup 
                                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Asignar Grupo
                            </button>
                        </div>
                    )}
                </div>

                {/* Grupos asignados */}
                {gruposAsignados.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300">
                        <h3 className="text-xl font-bold text-green-700 mb-4">Grupos Asignados al Potrero</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gruposAsignados.map(grupo => (
                                <div key={grupo.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-green-800">ID: {grupo.id}</div>
                                            <div className="text-sm text-gray-600">Especie: {grupo.especie}</div>
                                            <div className="text-sm text-gray-600">Animales: {grupo.miembros.length}</div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoverGrupo(grupo.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow transition"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Animales en el potrero */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-300">
                    <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">
                        Animales actualmente en el potrero ({animalesEnPotrero.length})
                    </h3>

                    {animalesEnPotrero.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">No hay animales asignados a este potrero.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {animalesEnPotrero.map((animal) => (
                                <div key={animal.id} className="bg-gray-50 rounded-xl shadow-lg p-4 border-2 border-green-200 flex flex-col items-center">
                                    <img 
                                        src={animal.foto || "/images/Ganado_Relleno/animal_default.png"} 
                                        alt={animal.nombre} 
                                        className="w-24 h-24 object-cover rounded-lg border border-green-300 mb-3"
                                        onError={(e) => { e.target.src = "/images/Ganado_Relleno/animal_default.png"; }}
                                    />
                                    <div className="font-bold text-green-800 mb-1 text-center">{animal.nombre}</div>
                                    <div className="text-sm text-gray-700">ID: {animal.identificacion || animal.id}</div>
                                    <div className="text-sm text-gray-700">Especie: {animal.especie}</div>
                                    <div className="text-sm text-gray-700">Raza: {animal.raza}</div>
                                    <div className="text-sm text-gray-700">Sexo: {animal.sexo}</div>
                                    <div className="text-sm text-gray-700">Peso: {animal.peso} kg</div>
                                    <div className="text-sm text-gray-700">Grupo: {animal.grupo}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VisualizarPotrero;