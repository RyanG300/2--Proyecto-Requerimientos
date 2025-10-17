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

// Helpers internos
const getDefaultAnimalPhoto = (especie) => {
  const defaults = {
    'Bovino': '/images/Ganado_Bovino/vaca_1.png',
    'Ovino' : '/images/Ganado_Ovino/oveja_1.png',
    'Caprino': '/images/Ganado_Caprino/cabra_1.png'
  };
  return defaults[especie] || '/images/Ganado_Relleno/animal_default.png';
};

const readLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLS = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario
  useEffect(() => {
    try {
      const loggedUser = localStorage.getItem('loggedUser');
      if (loggedUser) setUser(JSON.parse(loggedUser));
    } catch (e) {
      console.error('Error al cargar usuario desde localStorage:', e);
      localStorage.removeItem('loggedUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ====== AUTENTICACIÓN ======
  const login = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('loggedUser', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error al hacer login:', error);
      return false;
    }
  };

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

  const isAuthenticated = () => user !== null;
  const getUserInfo = (field) => (user ? user[field] : null);

  // ====== EMPRESAS ======
  const generateCompanyId = () => `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const createCompany = (companyData) => {
    try {
      const companies = readLS('companies', []);
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
      writeLS('companies', companies);

      const updatedUser = { ...user, companyId: newCompany.id };
      setUser(updatedUser);
      localStorage.setItem('loggedUser', JSON.stringify(updatedUser));

      return { success: true, company: newCompany };
    } catch (error) {
      console.error('Error al crear empresa:', error);
      return { success: false, error: 'Error al crear la empresa' };
    }
  };

  const joinCompany = (companyId) => {
    try {
      const companies = readLS('companies', []);
      const idx = companies.findIndex(c => c.id === companyId);
      if (idx === -1) return { success: false, error: 'Empresa no encontrada' };

      const company = companies[idx];
      if (company.members.includes(user.email)) {
        return { success: false, error: 'Ya eres miembro de esta empresa' };
      }

      company.members.push(user.email);
      companies[idx] = company;
      writeLS('companies', companies);

      const updatedUser = { ...user, companyId };
      setUser(updatedUser);
      localStorage.setItem('loggedUser', JSON.stringify(updatedUser));

      return { success: true, company };
    } catch (error) {
      console.error('Error al unirse a empresa:', error);
      return { success: false, error: 'Error al unirse a la empresa' };
    }
  };

  const getUserCompany = () => {
    try {
      if (!user) return null;
      const companies = readLS('companies', []);
      return companies.find(comp => comp.members.includes(user.email)) || null;
    } catch (error) {
      console.error('Error al obtener empresa del usuario:', error);
      return null;
    }
  };

  const isCompanyOwner = () => {
    const c = getUserCompany();
    return c && c.owner === user?.email;
  };

  const leaveCompany = () => {
    try {
      if (!user) return { success: false, error: 'Debes estar logueado' };
      const userCompany = getUserCompany();
      if (!userCompany) return { success: false, error: 'No perteneces a ninguna empresa' };

      const companies = readLS('companies', []);
      const idx = companies.findIndex(c => c.id === userCompany.id);
      if (idx !== -1) {
        const company = companies[idx];
        if (company.owner === user.email) {
          return { success: false, error: 'Como propietario, no puedes salir de la empresa' };
        }
        company.members = company.members.filter(m => m !== user.email);
        companies[idx] = company;
        writeLS('companies', companies);
      }
      return { success: true };
    } catch (error) {
      console.error('Error al salir de empresa:', error);
      return { success: false, error: 'Error al salir de la empresa' };
    }
  };

  // ====== UTILIDADES VINCULADAS A EMPRESA ======
  const getCompanyId = () => {
    const c = getUserCompany();
    return c?.id || null;
  };

  // ====== GANADO ======
  const checkAreteExists = (arete) => {
    try {
      const cid = getCompanyId();
      if (!cid) return false;
      const livestock = readLS('livestock', {});
      const arr = livestock[cid] || [];
      return arr.some(a => a.id === arete);
    } catch (error) {
      console.error('Error al verificar arete:', error);
      return false;
    }
  };

  const addAnimal = (animalData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para agregar ganado' };
      if (checkAreteExists(animalData.identificacion)) {
        return { success: false, error: `El arete "${animalData.identificacion}" ya está registrado en tu empresa` };
      }

      const livestock = readLS('livestock', {});
      if (!livestock[cid]) livestock[cid] = [];

      const newAnimal = {
        id: animalData.identificacion,
        identificacion: animalData.identificacion,
        nombre: animalData.nombre || `Animal ${animalData.identificacion}`,
        especie: animalData.especie,
        raza: animalData.raza,
        sexo: animalData.sexo,
        fechaNacimiento: animalData.fechaNacimiento,
        peso: animalData.peso,
        grupo: animalData.grupo || null,
        foto: animalData.foto || getDefaultAnimalPhoto(animalData.especie),
        companyId: cid,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      };

      livestock[cid].push(newAnimal);
      writeLS('livestock', livestock);

      return { success: true, animal: newAnimal };
    } catch (error) {
      console.error('Error al agregar animal:', error);
      return { success: false, error: 'Error al agregar el animal' };
    }
  };

  const getCompanyLivestock = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return [];
      const livestock = readLS('livestock', {});
      return livestock[cid] || [];
    } catch (error) {
      console.error('Error al obtener ganado de la empresa:', error);
      return [];
    }
  };

  const getAnimalById = (animalId) => {
    try {
      const arr = getCompanyLivestock();
      return arr.find(a => a.id === animalId) || null;
    } catch (error) {
      console.error('Error al obtener animal por ID:', error);
      return null;
    }
  };

  const updateAnimal = (animalId, updateData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para actualizar ganado' };

      const livestock = readLS('livestock', {});
      if (!livestock[cid]) return { success: false, error: 'No se encontró ganado en esta empresa' };

      const idx = livestock[cid].findIndex(a => a.id === animalId);
      if (idx === -1) return { success: false, error: 'Animal no encontrado' };

      livestock[cid][idx] = {
        ...livestock[cid][idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      };
      writeLS('livestock', livestock);

      return { success: true, animal: livestock[cid][idx] };
    } catch (error) {
      console.error('Error al actualizar animal:', error);
      return { success: false, error: 'Error al actualizar el animal' };
    }
  };

  const deleteAnimal = (animalId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para eliminar ganado' };

      const livestock = readLS('livestock', {});
      if (!livestock[cid]) return { success: false, error: 'No se encontró ganado en esta empresa' };

      livestock[cid] = livestock[cid].filter(a => a.id !== animalId);
      writeLS('livestock', livestock);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar animal:', error);
      return { success: false, error: 'Error al eliminar el animal' };
    }
  };

  // ====== GRUPOS (NUEVO) ======
  const getCompanyGroups = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return [];
      const groups = readLS('groups', {});
      return groups[cid] || [];
    } catch (e) {
      console.error('Error al obtener grupos:', e);
      return [];
    }
  };

  const checkGroupExists = (codigo) => {
    const id = (codigo || '').trim();
    if (!id) return false;
    const arr = getCompanyGroups();
    return arr.some(g => (g.id || g.codigo) === id);
  };

  // Para AddGrupos: listar animales por especie y opcionalmente solo los sin grupo
  const listAnimals = ({ especie, onlyUngrouped } = {}) => {
    let arr = getCompanyLivestock();
    if (especie) arr = arr.filter(a => a.especie === especie);
    if (onlyUngrouped) arr = arr.filter(a => !a.grupo);
    return Promise.resolve(arr);
  };

  const addGroup = (grupoData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para crear grupos' };

      const id = (grupoData?.id || grupoData?.codigo || '').trim();
      if (!id) return { success: false, error: 'Código/ID de grupo requerido' };
      if (checkGroupExists(id)) return { success: false, error: 'El código de grupo ya existe' };

      const groups = readLS('groups', {});
      if (!groups[cid]) groups[cid] = [];

      const newGroup = {
        id,
        codigo: id,
        nombre: grupoData.nombre || id,
        especie: grupoData.especie,
        objetivo: grupoData.objetivo || '',
        potrero: grupoData.potrero || null,
        foto: grupoData.foto || null,
        alimentacion: grupoData.alimentacion || {},
        miembros: Array.isArray(grupoData.miembros) ? [...grupoData.miembros] : [],
        createdAt: grupoData.createdAt || new Date().toISOString(),
        createdBy: user?.email || 'sistema'
      };

      groups[cid] = [newGroup, ...(groups[cid] || [])];
      writeLS('groups', groups);

      // Si hay miembros, asignarlos al grupo en el ganado
      if (newGroup.miembros.length) {
        const setIds = new Set(newGroup.miembros);
        const livestock = readLS('livestock', {});
        const companyLivestock = livestock[cid] || [];
        const updated = companyLivestock.map(a => {
          const key = a.identificacion || a.id;
          return setIds.has(key) ? { ...a, grupo: id } : a;
        });
        livestock[cid] = updated;
        writeLS('livestock', livestock);
      }

      return { success: true, group: newGroup };
    } catch (error) {
      console.error('Error al crear grupo:', error);
      return { success: false, error: 'Error interno al crear grupo' };
    }
  };

  // (Opcional) editar/eliminar grupo — por si luego quieres botones de acción
  const updateGroup = (groupId, updateData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };
      const groups = readLS('groups', {});
      if (!groups[cid]) return { success: false, error: 'No hay grupos' };

      const idx = groups[cid].findIndex(g => g.id === groupId);
      if (idx === -1) return { success: false, error: 'Grupo no encontrado' };

      groups[cid][idx] = {
        ...groups[cid][idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'sistema'
      };
      writeLS('groups', groups);
      return { success: true, group: groups[cid][idx] };
    } catch (e) {
      return { success: false, error: 'Error al actualizar grupo' };
    }
  };

  const deleteGroup = (groupId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };
      const groups = readLS('groups', {});
      if (!groups[cid]) return { success: false, error: 'No hay grupos' };

      // Quitar grupo de los animales que lo tenían
      const livestock = readLS('livestock', {});
      if (livestock[cid]) {
        livestock[cid] = livestock[cid].map(a => (a.grupo === groupId ? { ...a, grupo: null } : a));
        writeLS('livestock', livestock);
      }

      groups[cid] = groups[cid].filter(g => g.id !== groupId);
      writeLS('groups', groups);
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Error al eliminar grupo' };
    }
  };

  const value = {
    // Auth
    user,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getUserInfo,

    // Empresa
    createCompany,
    joinCompany,
    getUserCompany,
    isCompanyOwner,
    leaveCompany,

    // Ganado
    checkAreteExists,
    addAnimal,
    getCompanyLivestock,
    getAnimalById,
    updateAnimal,
    deleteAnimal,

    // Grupos (nuevo)
    getCompanyGroups,
    addGroup,
    checkGroupExists,
    listAnimals,
    updateGroup,  // opcional
    deleteGroup,  // opcional
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
