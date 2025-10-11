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
            if (!user) {
                return null;
            }

            const companies = JSON.parse(localStorage.getItem('companies')) || [];
            
            // Buscar empresa donde el usuario es miembro
            const foundCompany = companies.find(comp => comp.members.includes(user.email));
            
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
            if (!user) {
                return { success: false, error: 'Debes estar logueado' };
            }

            const userCompany = getUserCompany();
            if (!userCompany) {
                return { success: false, error: 'No perteneces a ninguna empresa' };
            }

            const companies = JSON.parse(localStorage.getItem('companies')) || [];
            const companyIndex = companies.findIndex(comp => comp.id === userCompany.id);

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

            // No necesitamos actualizar el usuario ya que no guardamos companyId
            return { success: true };
        } catch (error) {
            console.error('Error al salir de empresa:', error);
            return { success: false, error: 'Error al salir de la empresa' };
        }
    };

    // === FUNCIONES PARA GANADO ===

    // Verificar si un arete ya existe en la empresa
    const checkAreteExists = (arete) => {
        try {
            if (!user) {
                return false;
            }

            const userCompany = getUserCompany();
            if (!userCompany) {
                return false;
            }

            const livestock = JSON.parse(localStorage.getItem('livestock')) || {};
            const companyLivestock = livestock[userCompany.id] || [];
            
            return companyLivestock.some(animal => animal.id === arete);
        } catch (error) {
            console.error('Error al verificar arete:', error);
            return false;
        }
    };

    // Agregar nuevo animal a la empresa
    const addAnimal = (animalData) => {
        try {
            if (!user) {
                return { success: false, error: 'Debes estar logueado para agregar ganado' };
            }

            const userCompany = getUserCompany();
            if (!userCompany) {
                return { success: false, error: 'Debes pertenecer a una empresa para agregar ganado' };
            }

            // Verificar que el arete no esté repetido
            if (checkAreteExists(animalData.identificacion)) {
                return { success: false, error: `El arete "${animalData.identificacion}" ya está registrado en tu empresa` };
            }

            const livestock = JSON.parse(localStorage.getItem('livestock')) || {};
            const companyId = userCompany.id;
            
            // Inicializar array de la empresa si no existe
            if (!livestock[companyId]) {
                livestock[companyId] = [];
            }

            const newAnimal = {
                id: animalData.identificacion, // Usar el arete como ID
                identificacion: animalData.identificacion, // Mantener también este campo para compatibilidad
                nombre: animalData.nombre || `Animal ${animalData.identificacion}`,
                especie: animalData.especie,
                raza: animalData.raza,
                sexo: animalData.sexo,
                fechaNacimiento: animalData.fechaNacimiento,
                peso: animalData.peso,
                grupo: animalData.grupo || null,
                foto: animalData.foto || getDefaultAnimalPhoto(animalData.especie),
                companyId: companyId,
                createdAt: new Date().toISOString(),
                createdBy: user.email
            };

            livestock[companyId].push(newAnimal);
            localStorage.setItem('livestock', JSON.stringify(livestock));

            return { success: true, animal: newAnimal };
        } catch (error) {
            console.error('Error al agregar animal:', error);
            return { success: false, error: 'Error al agregar el animal' };
        }
    };

    // Obtener ganado de la empresa del usuario
    const getCompanyLivestock = () => {
        try {
            if (!user) {
                return [];
            }

            const userCompany = getUserCompany();
            if (!userCompany) {
                return [];
            }

            const livestock = JSON.parse(localStorage.getItem('livestock')) || {};
            return livestock[userCompany.id] || [];
        } catch (error) {
            console.error('Error al obtener ganado de la empresa:', error);
            return [];
        }
    };

    // Obtener animal específico por ID
    const getAnimalById = (animalId) => {
        try {
            const companyLivestock = getCompanyLivestock();
            return companyLivestock.find(animal => animal.id === animalId) || null;
        } catch (error) {
            console.error('Error al obtener animal por ID:', error);
            return null;
        }
    };

    // Actualizar información de un animal
    const updateAnimal = (animalId, updateData) => {
        try {
            if (!user) {
                return { success: false, error: 'No tienes permisos para actualizar este animal' };
            }

            const userCompany = getUserCompany();
            if (!userCompany) {
                return { success: false, error: 'Debes pertenecer a una empresa para actualizar ganado' };
            }

            const livestock = JSON.parse(localStorage.getItem('livestock')) || {};
            const companyId = userCompany.id;
            
            if (!livestock[companyId]) {
                return { success: false, error: 'No se encontró ganado en esta empresa' };
            }

            const animalIndex = livestock[companyId].findIndex(animal => animal.id === animalId);
            if (animalIndex === -1) {
                return { success: false, error: 'Animal no encontrado' };
            }

            livestock[companyId][animalIndex] = {
                ...livestock[companyId][animalIndex],
                ...updateData,
                updatedAt: new Date().toISOString(),
                updatedBy: user.email
            };

            localStorage.setItem('livestock', JSON.stringify(livestock));
            return { success: true, animal: livestock[companyId][animalIndex] };
        } catch (error) {
            console.error('Error al actualizar animal:', error);
            return { success: false, error: 'Error al actualizar el animal' };
        }
    };

    // Eliminar animal
    const deleteAnimal = (animalId) => {
        try {
            if (!user) {
                return { success: false, error: 'No tienes permisos para eliminar este animal' };
            }

            const userCompany = getUserCompany();
            if (!userCompany) {
                return { success: false, error: 'Debes pertenecer a una empresa para eliminar ganado' };
            }

            const livestock = JSON.parse(localStorage.getItem('livestock')) || {};
            const companyId = userCompany.id;
            
            if (!livestock[companyId]) {
                return { success: false, error: 'No se encontró ganado en esta empresa' };
            }

            livestock[companyId] = livestock[companyId].filter(animal => animal.id !== animalId);
            localStorage.setItem('livestock', JSON.stringify(livestock));
            
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar animal:', error);
            return { success: false, error: 'Error al eliminar el animal' };
        }
    };

    // Función auxiliar para obtener foto por defecto según especie
    const getDefaultAnimalPhoto = (especie) => {
        const defaultPhotos = {
            'Bovino': '/images/Ganado_Bovino/vaca_1.png',
            'Ovino': '/images/Ganado_Ovino/oveja_1.png',
            'Caprino': '/images/Ganado_Caprino/cabra_1.png'
        };
        return defaultPhotos[especie] || '/images/Ganado_Relleno/animal_default.png';
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
        leaveCompany,
        // Funciones de ganado
        checkAreteExists,
        addAnimal,
        getCompanyLivestock,
        getAnimalById,
        updateAnimal,
        deleteAnimal
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;