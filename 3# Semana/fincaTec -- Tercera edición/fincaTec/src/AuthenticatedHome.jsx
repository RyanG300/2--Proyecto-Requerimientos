// src/AuthenticatedHome.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './UserContext';
import MainMenu from './mainMenu';

// Componente que maneja la ruta raíz según el estado de autenticación
const AuthenticatedHome = () => {
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

    // Si está autenticado, redirigir al App
    if (isAuthenticated()) {
        return <Navigate to="/App" replace />;
    }

    // Si no está autenticado, mostrar el MainMenu
    return <MainMenu />;
};

export default AuthenticatedHome;