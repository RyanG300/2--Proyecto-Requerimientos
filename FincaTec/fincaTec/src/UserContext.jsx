import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const UserContext = createContext();

// Hook personalizado para usar el contexto
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser debe ser usado dentro de un UserProvider');
    }
    return context;
};

// Proveedor del contexto
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar si hay un usuario logueado al cargar la aplicación
    useEffect(() => {
        const checkLoggedUser = () => {
            try {
                const loggedUser = localStorage.getItem('loggedUser');
                if (loggedUser) {
                    setUser(JSON.parse(loggedUser));
                }
            } catch (error) {
                console.error('Error al cargar usuario desde localStorage:', error);
                localStorage.removeItem('loggedUser');
            } finally {
                setIsLoading(false);
            }
        };

        checkLoggedUser();
    }, []);

    // Función para hacer login
    const login = (userData) => {
        try {
            // Guardar usuario en el estado
            setUser(userData);
            // Persistir en localStorage
            localStorage.setItem('loggedUser', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error('Error al hacer login:', error);
            return false;
        }
    };

    // Función para hacer logout
    const logout = () => {
        try {
            setUser(null);
            localStorage.removeItem('loggedUser');
            return true;
        } catch (error) {
            console.error('Error al hacer logout:', error);
            return false;
        }
    };

    // Función para actualizar información del usuario
    const updateUser = (newUserData) => {
        try {
            const updatedUser = { ...user, ...newUserData };
            setUser(updatedUser);
            localStorage.setItem('loggedUser', JSON.stringify(updatedUser));
            return true;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return false;
        }
    };

    // Verificar si el usuario está autenticado
    const isAuthenticated = () => {
        return user !== null;
    };

    // Obtener información específica del usuario
    const getUserInfo = (field) => {
        return user ? user[field] : null;
    };

    // === FUNCIONES PARA EMPRESAS ===

    // Generar ID único para empresa
    const generateCompanyId = () => {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        return `EMP-${timestamp}-${randomNum}`;
    };

    // Crear nueva empresa
    const createCompany = (companyData) => {
        try {
            const companies = JSON.parse(localStorage.getItem('companies')) || [];
            const newCompany = {
                id: generateCompanyId(),
                name: companyData.name,
                description: companyData.description,
                photo: companyData.photo || null,
                location: companyData.location,
                owner: user.email,
                members: [user.email],
                createdAt: new Date().toISOString()
            };

            companies.push(newCompany);
            localStorage.setItem('companies', JSON.stringify(companies));

            // Actualizar usuario con la empresa
            const updatedUser = { ...user, companyId: newCompany.id };
            setUser(updatedUser);
            localStorage.setItem('loggedUser', JSON.stringify(updatedUser));

            return { success: true, company: newCompany };
        } catch (error) {
            console.error('Error al crear empresa:', error);
            return { success: false, error: 'Error al crear la empresa' };
        }
    };

    // Unirse a una empresa
    const joinCompany = (companyId) => {
        try {
            const companies = JSON.parse(localStorage.getItem('companies')) || [];
            const companyIndex = companies.findIndex(comp => comp.id === companyId);

            if (companyIndex === -1) {
                return { success: false, error: 'Empresa no encontrada' };
            }

            const company = companies[companyIndex];
            
            // Verificar si el usuario ya es miembro
            if (company.members.includes(user.email)) {
                return { success: false, error: 'Ya eres miembro de esta empresa' };
            }

            // Agregar usuario a la empresa
            company.members.push(user.email);
            companies[companyIndex] = company;
            localStorage.setItem('companies', JSON.stringify(companies));

            // Actualizar usuario con la empresa
            const updatedUser = { ...user, companyId: companyId };
            setUser(updatedUser);
            localStorage.setItem('loggedUser', JSON.stringify(updatedUser));

            return { success: true, company };
        } catch (error) {
            console.error('Error al unirse a empresa:', error);
            return { success: false, error: 'Error al unirse a la empresa' };
        }
    };

    // Obtener información de la empresa del usuario
    const getUserCompany = () => {
        try {
            if (!user || !user.companyId) {
                return null;
            }

            const companies = JSON.parse(localStorage.getItem('companies')) || [];
            const foundCompany = companies.find(comp => comp.id === user.companyId);
            
            return foundCompany || null;
        } catch (error) {
            console.error('Error al obtener empresa del usuario:', error);
            return null;
        }
    };

    // Verificar si el usuario es propietario de su empresa
    const isCompanyOwner = () => {
        const company = getUserCompany();
        return company && company.owner === user?.email;
    };

    // Salir de una empresa
    const leaveCompany = () => {
        try {
            if (!user || !user.companyId) {
                return { success: false, error: 'No perteneces a ninguna empresa' };
            }

            const companies = JSON.parse(localStorage.getItem('companies')) || [];
            const companyIndex = companies.findIndex(comp => comp.id === user.companyId);

            if (companyIndex !== -1) {
                const company = companies[companyIndex];
                
                // Si es el propietario, no puede salir (debe transferir o eliminar)
                if (company.owner === user.email) {
                    return { success: false, error: 'Como propietario, no puedes salir de la empresa' };
                }

                // Remover usuario de la empresa
                company.members = company.members.filter(member => member !== user.email);
                companies[companyIndex] = company;
                localStorage.setItem('companies', JSON.stringify(companies));
            }

            // Actualizar usuario removiendo la empresa
            const updatedUser = { ...user };
            delete updatedUser.companyId;
            setUser(updatedUser);
            localStorage.setItem('loggedUser', JSON.stringify(updatedUser));

            return { success: true };
        } catch (error) {
            console.error('Error al salir de empresa:', error);
            return { success: false, error: 'Error al salir de la empresa' };
        }
    };

    const value = {
        user,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated,
        getUserInfo,
        // Funciones de empresa
        createCompany,
        joinCompany,
        getUserCompany,
        isCompanyOwner,
        leaveCompany
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;