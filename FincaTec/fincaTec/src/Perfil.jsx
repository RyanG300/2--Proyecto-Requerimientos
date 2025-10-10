import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';

function Perfil() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
            navigate('/');
        }
    };

    const handleGoToApp = () => {
        navigate('/App');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Contenido principal */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
                        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">
                            Vista de Empresa
                        </h1>
                        
                        <div className="bg-green-50 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-green-800 mb-4">
                                Información del Usuario
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Nombre:</span> {user?.name || 'No especificado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Email:</span> {user?.email || 'No especificado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Empresa:</span> {user?.company || 'No especificada'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-700">
                                        <span className="font-semibold">Teléfono:</span> {user?.phone || 'No especificado'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        </div>
    );
}

export default Perfil;

