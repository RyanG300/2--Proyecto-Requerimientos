import { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

function CompanyView() {
    const { user, logout, getUserCompany, isCompanyOwner, createCompany, joinCompany } = useUser();
    const navigate = useNavigate();
    const [activeForm, setActiveForm] = useState(null); // 'join', 'create', null
    const [loading, setLoading] = useState(false);
    const [userCompany, setUserCompany] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    // Estados para formularios
    const [joinCompanyId, setJoinCompanyId] = useState('');
    const [newCompany, setNewCompany] = useState({
        name: '',
        description: '',
        photo: '',
        location: ''
    });

    // Actualizar información de la empresa cuando el usuario cambie
    useEffect(() => {
        const company = getUserCompany();
        const owner = isCompanyOwner();
        setUserCompany(company);
        setIsOwner(owner);
    }, [user, getUserCompany, isCompanyOwner]);

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
            navigate('/');
        }
    };

    const handleGoToApp = () => {
        navigate('/App');
    };

    const handleGoToPerfil = () => {
        navigate('/perfil');
    };

    // Manejar unirse a empresa
    const handleJoinCompany = async (e) => {
        e.preventDefault();
        if (!joinCompanyId.trim()) {
            alert('Por favor ingresa un ID de empresa válido');
            return;
        }

        setLoading(true);
        const result = joinCompany(joinCompanyId.trim());
        setLoading(false);

        if (result.success) {
            alert(`¡Te has unido exitosamente a ${result.company.name}!`);
            setActiveForm(null);
            setJoinCompanyId('');
            // El useEffect se encargará de actualizar el estado
        } else {
            alert(result.error);
        }
    };

    // Manejar crear empresa
    const handleCreateCompany = async (e) => {
        e.preventDefault();
        if (!newCompany.name.trim() || !newCompany.description.trim() || !newCompany.location.trim()) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        setLoading(true);
        const result = createCompany(newCompany);
        setLoading(false);

        if (result.success) {
            alert(`¡Empresa "${result.company.name}" creada exitosamente!`);
            setActiveForm(null);
            setNewCompany({ name: '', description: '', photo: '', location: '' });
            // El useEffect se encargará de actualizar el estado
        } else {
            alert(result.error);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setNewCompany({ ...newCompany, photo: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-500 via-green-400 to-green-300 shadow-md">
                <img src="images/Menu_finqueros/icono_FincaTec.png" alt="Logo FincaTec" width="100" height="50" className="bg-white rounded-3xl p-1 shadow-md"/>
                
                {/* Usuario logueado */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-green-200 via-green-100 to-green-300 shadow-lg border border-green-400">
                        <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 4-7 8-7s8 3 8 7"/>
                        </svg>
                        <span className="text-xl font-bold text-green-900 tracking-wide">
                            ¡Bienvenido, {user?.name || user?.email || 'Usuario'}!
                        </span>
                    </div>
                </div>
                {/** Botón de perfil y salir */}
                <div className="flex gap-4 items-center">
                    <button onClick={handleGoToPerfil} className="bg-white hover:bg-blue-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition">
                        <img src="images/Menu_finqueros/icono_perfil.png" alt="Perfil" className="w-10 h-10" />
                        <span className="font-bold text-green-700">Perfil</span>
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="bg-white hover:bg-red-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition"
                    >
                        <img src="images/Menu_finqueros/icono_salir.png" alt="Salir" className="w-10 h-10" />
                        <span className="font-bold text-green-700">Salir</span>
                    </button>
                </div>
            </header>

            {/* Contenido principal */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {userCompany ? (
                        // Usuario pertenece a una empresa - Mostrar información
                        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
                            <div className="text-center mb-6">
                                <h1 className="text-3xl font-bold text-green-700 mb-2">
                                    {userCompany.name}
                                </h1>
                                {isOwner && (
                                    <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        Propietario
                                    </span>
                                )}
                            </div>

                            {/* Foto de la empresa */}
                            {userCompany.photo && (
                                <div className="text-center mb-6">
                                    <img 
                                        src={userCompany.photo} 
                                        alt={`Foto de ${userCompany.name}`}
                                        className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-green-300"
                                    />
                                </div>
                            )}

                            {/* Información de la empresa */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Descripción</h3>
                                    <p className="text-gray-700">{userCompany.description}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Ubicación</h3>
                                    <p className="text-gray-700">{userCompany.location}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Miembros</h3>
                                    <p className="text-gray-700">{userCompany.members.length} miembro(s)</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Propietario</h3>
                                    <p className="text-gray-700">{userCompany.owner}</p>
                                </div>
                            </div>

                            {/* ID para unirse (solo para propietario) */}
                            {isOwner && (
                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                        ID para que otros se unan:
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-yellow-200 px-3 py-1 rounded text-yellow-900 font-mono">
                                            {userCompany.id}
                                        </code>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(userCompany.id)}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Botón para ir a la aplicación */}
                            <div className="text-center">
                                <button
                                    onClick={handleGoToApp}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition text-lg"
                                >
                                    Ir a la Aplicación Principal
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Usuario NO pertenece a empresa - Mostrar opciones
                        <div className="space-y-6">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold text-green-700 mb-2">
                                    Gestión de Empresa Ganadera
                                </h1>
                                <p className="text-gray-600">
                                    Para acceder a la aplicación, necesitas pertenecer a una empresa ganadera
                                </p>
                            </div>

                            {/* Opciones principales */}
                            {!activeForm && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Unirse a empresa */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-400">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-blue-700 mb-2">
                                                Unirse a Empresa
                                            </h2>
                                            <p className="text-gray-600 mb-4">
                                                ¿Ya tienes el ID de una empresa? Únete aquí
                                            </p>
                                            <button
                                                onClick={() => setActiveForm('join')}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                                            >
                                                Unirse
                                            </button>
                                        </div>
                                    </div>

                                    {/* Crear empresa */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-400">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-green-700 mb-2">
                                                Crear Empresa
                                            </h2>
                                            <p className="text-gray-600 mb-4">
                                                Registra tu propia empresa ganadera
                                            </p>
                                            <button
                                                onClick={() => setActiveForm('create')}
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                                            >
                                                Crear
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Formulario para unirse */}
                            {activeForm === 'join' && (
                                <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-400">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-blue-700">Unirse a Empresa</h2>
                                        <button
                                            onClick={() => setActiveForm(null)}
                                            className="text-gray-500 hover:text-gray-700 text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <form onSubmit={handleJoinCompany} className="space-y-4">
                                        <div>
                                            <label className="block font-semibold text-blue-800 mb-2">
                                                ID de la Empresa
                                            </label>
                                            <input
                                                type="text"
                                                value={joinCompanyId}
                                                onChange={(e) => setJoinCompanyId(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                                placeholder="Ej: EMP-1234567890-123"
                                                required
                                            />
                                            <p className="text-sm text-gray-600 mt-1">
                                                Solicita este ID al propietario de la empresa
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                {loading ? 'Uniéndose...' : 'Unirse'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveForm(null)}
                                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Formulario para crear empresa */}
                            {activeForm === 'create' && (
                                <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-green-700">Crear Nueva Empresa</h2>
                                        <button
                                            onClick={() => setActiveForm(null)}
                                            className="text-gray-500 hover:text-gray-700 text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateCompany} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block font-semibold text-green-800 mb-2">
                                                    Nombre de la Empresa *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCompany.name}
                                                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                                                    placeholder="Ej: Finca Los Andes"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block font-semibold text-green-800 mb-2">
                                                    Ubicación *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCompany.location}
                                                    onChange={(e) => setNewCompany({...newCompany, location: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                                                    placeholder="Ej: Cundinamarca, Colombia"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-green-800 mb-2">
                                                Descripción *
                                            </label>
                                            <textarea
                                                value={newCompany.description}
                                                onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 h-24"
                                                placeholder="Describe tu empresa ganadera..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-green-800 mb-2">
                                                Foto de la Empresa (Opcional)
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500"
                                            />
                                            {newCompany.photo && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={newCompany.photo} 
                                                        alt="Preview" 
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
                                            >
                                                {loading ? 'Creando...' : 'Crear Empresa'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveForm(null)}
                                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Separador */}
            <div className="size-15"></div>

            {/* Footer */}
            <footer className="bottom-0 left-0 w-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-white text-center py-3 shadow-lg font-semibold tracking-wide">
                <p>&copy; 2025 FincaTec. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default CompanyView