import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useUser();

    // Mostrar loading mientras se verifica la autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    // Si está autenticado, mostrar el componente
    return children;
};

export default ProtectedRoute;