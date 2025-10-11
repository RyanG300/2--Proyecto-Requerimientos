
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function AddGanado() {
    const { addAnimal, getUserCompany, user, checkAreteExists } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userCompany, setUserCompany] = useState(null);
    const [areteError, setAreteError] = useState('');
    const [formData, setFormData] = useState({
        identificacion: '',
        nombre: '',
        especie: '',
        raza: '',
        sexo: '',
        fechaNacimiento: '',
        peso: '',
        grupo: '',
        foto: null
    });

    // Cargar información de la empresa cuando el componente se monta o el usuario cambia
    useEffect(() => {
        const company = getUserCompany();
        setUserCompany(company);
    }, [user, getUserCompany]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validar arete en tiempo real
        if (name === 'identificacion') {
            if (value.trim() === '') {
                setAreteError('');
            } else if (checkAreteExists(value.trim())) {
                setAreteError('Este arete ya está registrado en tu empresa');
            } else {
                setAreteError('');
            }
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    foto: event.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userCompany) {
            alert('Debes pertenecer a una empresa para agregar ganado');
            return;
        }

        if (!formData.identificacion.trim() || !formData.especie.trim() || !formData.raza.trim() || 
            !formData.sexo.trim() || !formData.fechaNacimiento.trim() || !formData.peso.trim()) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        // Verificar si hay error en el arete
        if (areteError) {
            alert('Por favor corrige el error en el número de arete');
            return;
        }

        // Verificar nuevamente el arete antes de enviar (doble validación)
        if (checkAreteExists(formData.identificacion.trim())) {
            alert('Este arete ya está registrado en tu empresa');
            return;
        }

        setLoading(true);

        const animalData = {
            identificacion: formData.identificacion.trim(),
            nombre: formData.nombre.trim() || `Animal ${formData.identificacion}`,
            especie: formData.especie,
            raza: formData.raza.trim(),
            sexo: formData.sexo,
            fechaNacimiento: formData.fechaNacimiento,
            peso: parseFloat(formData.peso),
            grupo: formData.grupo || null,
            foto: formData.foto
        };

        const result = addAnimal(animalData);
        setLoading(false);

        if (result.success) {
            alert(`¡Animal "${result.animal.nombre}" agregado exitosamente!`);
            // Limpiar formulario
            setFormData({
                identificacion: '',
                nombre: '',
                especie: '',
                raza: '',
                sexo: '',
                fechaNacimiento: '',
                peso: '',
                grupo: '',
                foto: null
            });
            // Redirigir a la app principal
            navigate('/App');
        } else {
            alert(result.error);
        }
    };

    const handleCancel = () => {
        navigate('/App');
    };

    if (!userCompany) {
        return (
            <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-red-400">
                <h2 className="text-2xl font-bold text-red-700 mb-6">Acceso Restringido</h2>
                <p className="text-gray-700 mb-4">
                    Para agregar ganado, primero debes pertenecer a una empresa ganadera.
                </p>
                <button 
                    onClick={() => navigate('/company-view')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                    Ir a Gestión de Empresa
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-green-700">Añadir cabeza de ganado</h2>
                    <div className="text-sm text-gray-600">
                        Empresa: <span className="font-semibold text-green-700">{userCompany.name}</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Identificación única (arete/código) *
                            </label>
                            <input 
                                type="text" 
                                name="identificacion"
                                value={formData.identificacion}
                                onChange={handleInputChange}
                                className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                                    areteError 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:border-green-500'
                                }`}
                                placeholder="Ej: 12345" 
                                required
                            />
                            {areteError && (
                                <p className="text-red-500 text-sm mt-1 font-medium">
                                    ⚠️ Este arete ya está registrado en tu empresa
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Nombre (Opcional)
                            </label>
                            <input 
                                type="text" 
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" 
                                placeholder="Ej: Bella" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Especie *
                            </label>
                            <select 
                                name="especie"
                                value={formData.especie}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona una especie</option>
                                <option value="Bovino">Bovino</option>
                                <option value="Ovino">Ovino</option>
                                <option value="Caprino">Caprino</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Raza *
                            </label>
                            <input 
                                type="text" 
                                name="raza"
                                value={formData.raza}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" 
                                placeholder="Ej: Brahman, Holstein, etc." 
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Sexo *
                            </label>
                            <select 
                                name="sexo"
                                value={formData.sexo}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona</option>
                                <option value="Macho">Macho</option>
                                <option value="Hembra">Hembra</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Fecha de nacimiento *
                            </label>
                            <input 
                                type="date" 
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Peso (kg) *
                            </label>
                            <input 
                                type="number" 
                                name="peso"
                                value={formData.peso}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" 
                                placeholder="Ej: 350" 
                                min="1"
                                step="0.1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-semibold text-green-800 mb-2">
                                Grupo de pastoreo (Opcional)
                            </label>
                            <select 
                                name="grupo"
                                value={formData.grupo}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                            >
                                <option value="">Sin grupo asignado</option>
                                <option value="G-001">G-001 - Grupo Bovino</option>
                                <option value="G-002">G-002 - Grupo Ovino</option>
                                <option value="G-003">G-003 - Grupo Caprino</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-green-800 mb-2">
                            Foto del animal (Opcional)
                        </label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                        />
                        {formData.foto && (
                            <div className="mt-2">
                                <img 
                                    src={formData.foto} 
                                    alt="Preview" 
                                    className="w-24 h-24 object-cover rounded-lg border border-green-300"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={loading || areteError}
                            className={`font-semibold px-6 py-2 rounded-lg shadow transition ${
                                loading || areteError
                                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {loading ? 'Guardando...' : 'Guardar Animal'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddGanado
        
            