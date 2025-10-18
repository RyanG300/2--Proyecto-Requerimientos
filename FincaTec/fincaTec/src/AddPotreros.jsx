import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { provincias } from "./data";

function AddPotreros() {
    const { addPotrero, getUserCompany, user, isCompanyOwner } = useUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [userCompany, setUserCompany] = useState(null);
    const [fotoUrl, setFotoUrl] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        capacidad: '',
        provincia: '',
        canton: '',
        direccion: '',
        estado: '',
        foto: null
    });

    // Cargar información de la empresa y verificar permisos cuando el componente se monta
    useEffect(() => {
        // Verificar permisos de propietario
        if (!isCompanyOwner()) {
            alert('Solo el propietario de la empresa puede añadir potreros');
            navigate('/');
            return;
        }

        const company = getUserCompany();
        setUserCompany(company);
    }, [user, getUserCompany, isCompanyOwner, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    foto: event.target.result
                }));
                setFotoUrl(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({
                ...prev,
                foto: null
            }));
            setFotoUrl(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userCompany) {
            alert('Debes pertenecer a una empresa para agregar potreros');
            return;
        }

        if (!formData.nombre.trim() || !formData.capacidad.trim() || !formData.provincia.trim() || 
            !formData.canton.trim() || !formData.direccion.trim() || !formData.estado.trim()) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        if (parseInt(formData.capacidad) <= 0) {
            alert('La capacidad debe ser un número mayor a 0');
            return;
        }

        setLoading(true);

        const potreroData = {
            nombre: formData.nombre.trim(),
            capacidad: parseInt(formData.capacidad),
            provincia: formData.provincia,
            canton: formData.canton,
            direccion: formData.direccion.trim(),
            estado: formData.estado,
            foto: formData.foto
        };

        const result = addPotrero(potreroData);
        setLoading(false);

        if (result.success) {
            alert(`¡Potrero "${result.potrero.nombre}" agregado exitosamente!`);
            // Limpiar formulario
            setFormData({
                nombre: '',
                capacidad: '',
                provincia: '',
                canton: '',
                direccion: '',
                estado: '',
                foto: null
            });
            setFotoUrl(null);
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
                    Para agregar potreros, primero debes pertenecer a una empresa ganadera.
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
                    <h2 className="text-2xl font-bold text-green-700">Añadir potrero</h2>
                    <div className="text-sm text-gray-600">
                        Empresa: <span className="font-semibold text-green-700">{userCompany.name}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block font-semibold text-green-800 mb-2">Nombre del potrero *</label>
                        <input 
                            type="text" 
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" 
                            placeholder="Ej: Potrero La Esperanza" 
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-green-800 mb-2">Capacidad del potrero *</label>
                        <input 
                            type="number" 
                            name="capacidad"
                            value={formData.capacidad}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" 
                            placeholder="Ej: 50 cabezas de ganado" 
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-green-800 mb-2">Ubicación *</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                            <select 
                                name="provincia"
                                value={formData.provincia}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona Provincia</option>
                                {provincias.map((provincia) => (
                                    <option key={provincia.id} value={provincia.nombre}>{provincia.nombre}</option>
                                ))}
                            </select>
                            <select 
                                name="canton"
                                value={formData.canton}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                                required
                            >
                                <option value="">Selecciona Cantón</option>
                                {formData.provincia && provincias
                                    .find(p => p.nombre === formData.provincia)
                                    ?.cantones.map((canton, index) => (
                                        <option key={index} value={canton}>{canton}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-semibold text-green-800 mb-2">Dirección exacta *</label>
                        <input 
                            type="text" 
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500" 
                            placeholder="Ej: 500 metros al este de la iglesia, distrito X" 
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-green-800 mb-2">Estado *</label>
                        <select 
                            name="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                            required
                        >
                            <option value="">Selecciona estado</option>
                            <option value="Excelente calidad">Excelente calidad</option>
                            <option value="Buen estado">Buen estado</option>
                            <option value="Estado decente">Estado decente</option>
                            <option value="Decadente">Decadente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold text-green-800 mb-2">Foto del potrero (Opcional)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFotoChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                        />
                        {fotoUrl && (
                            <div className="mt-2">
                                <img 
                                    src={fotoUrl} 
                                    alt="Preview" 
                                    className="w-32 h-32 object-cover rounded-lg border border-green-300"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`font-semibold px-6 py-2 rounded-lg shadow transition ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {loading ? 'Guardando...' : 'Guardar Potrero'}
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
    );
}

export default AddPotreros
