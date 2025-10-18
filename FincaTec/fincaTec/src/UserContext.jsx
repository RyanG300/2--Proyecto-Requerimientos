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
    'Ovino': '/images/Ganado_Ovino/oveja_1.png',
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

const toEmail = (s) => (s || '').toString().trim().toLowerCase();

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
        informacionMedica: animalData.informacionMedica || {
          historialVacunas: [],
          historialEnfermedades: [],
          observacionesVeterinario: '',
          proximasVacunas: [],
          tratamientosActivos: [],
          fechaUltimaRevision: null,
          veterinarioAsignado: null
        },
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

      const oldAnimal = livestock[cid][idx];
      const oldGroup = oldAnimal.grupo;
      const newGroup = updateData.grupo;

      // Actualizar el animal
      livestock[cid][idx] = {
        ...oldAnimal,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      };
      writeLS('livestock', livestock);

      // Si cambió el grupo, actualizar los grupos correspondientes
      if (oldGroup !== newGroup) {
        const groups = readLS('groups', {});

        if (groups[cid]) {
          // Remover del grupo anterior si existía
          if (oldGroup) {
            const oldGroupIdx = groups[cid].findIndex(g => g.id === oldGroup);
            if (oldGroupIdx !== -1) {
              groups[cid][oldGroupIdx].miembros = (groups[cid][oldGroupIdx].miembros || [])
                .filter(id => id !== animalId);
            }
          }

          // Agregar al nuevo grupo si se especifica
          if (newGroup) {
            const newGroupIdx = groups[cid].findIndex(g => g.id === newGroup);
            if (newGroupIdx !== -1) {
              if (!groups[cid][newGroupIdx].miembros) {
                groups[cid][newGroupIdx].miembros = [];
              }
              if (!groups[cid][newGroupIdx].miembros.includes(animalId)) {
                groups[cid][newGroupIdx].miembros.push(animalId);
              }
            }
          }

          writeLS('groups', groups);
        }
      }

      return { success: true, animal: livestock[cid][idx] };
    } catch (error) {
      console.error('Error al actualizar animal:', error);
      return { success: false, error: 'Error al actualizar el animal' };
    }
  };

  const updateMedicalInfo = (animalId, medicalData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para actualizar información médica' };

      const livestock = readLS('livestock', {});
      if (!livestock[cid]) return { success: false, error: 'No se encontraron animales' };

      const idx = livestock[cid].findIndex(a => (a.identificacion || a.id) === animalId);
      if (idx === -1) return { success: false, error: 'Animal no encontrado' };

      // Actualizar la información médica
      livestock[cid][idx] = {
        ...livestock[cid][idx],
        informacionMedica: {
          ...livestock[cid][idx].informacionMedica,
          ...medicalData,
          fechaUltimaActualizacion: new Date().toISOString(),
          actualizadoPor: user?.email || 'sistema'
        },
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'sistema'
      };

      writeLS('livestock', livestock);
      return { success: true, animal: livestock[cid][idx] };
    } catch (error) {
      console.error('Error al actualizar información médica:', error);
      return { success: false, error: 'Error al actualizar la información médica' };
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

  // ====== POTREROS ======
  const getCompanyPotreros = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return [];
      const potreros = readLS('potreros', {});
      return potreros[cid] || [];
    } catch (e) {
      console.error('Error al obtener potreros:', e);
      return [];
    }
  };

  const addPotrero = (potreroData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para agregar potreros' };

      const potreros = readLS('potreros', {});
      if (!potreros[cid]) potreros[cid] = [];

      const newPotrero = {
        id: `POT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        nombre: potreroData.nombre,
        capacidad: parseInt(potreroData.capacidad),
        provincia: potreroData.provincia,
        canton: potreroData.canton,
        direccion: potreroData.direccion,
        estado: potreroData.estado,
        foto: potreroData.foto || null,
        gruposAsignados: [],
        ocupacionActual: 0,
        companyId: cid,
        createdAt: new Date().toISOString(),
        createdBy: user.email
      };

      potreros[cid].push(newPotrero);
      writeLS('potreros', potreros);

      return { success: true, potrero: newPotrero };
    } catch (error) {
      console.error('Error al agregar potrero:', error);
      return { success: false, error: 'Error al agregar el potrero' };
    }
  };

  const getPotreroById = (potreroId) => {
    try {
      const arr = getCompanyPotreros();
      return arr.find(p => p.id === potreroId) || null;
    } catch (error) {
      console.error('Error al obtener potrero por ID:', error);
      return null;
    }
  };

  const assignGroupToPotrero = (potreroId, grupoId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa' };

      const potreros = readLS('potreros', {});
      const groups = readLS('groups', {});

      if (!potreros[cid] || !groups[cid]) {
        return { success: false, error: 'No se encontraron datos' };
      }

      const potreroIdx = potreros[cid].findIndex(p => p.id === potreroId);
      const grupo = groups[cid].find(g => g.id === grupoId);

      if (potreroIdx === -1) return { success: false, error: 'Potrero no encontrado' };
      if (!grupo) return { success: false, error: 'Grupo no encontrado' };

      const potrero = potreros[cid][potreroIdx];

      // Verificar si el grupo ya está asignado
      if (potrero.gruposAsignados.includes(grupoId)) {
        return { success: false, error: 'El grupo ya está asignado a este potrero' };
      }

      // Verificar capacidad
      const nuevaOcupacion = potrero.ocupacionActual + grupo.miembros.length;
      if (nuevaOcupacion > potrero.capacidad) {
        return {
          success: false,
          error: `No hay suficiente capacidad. Disponible: ${potrero.capacidad - potrero.ocupacionActual}, Requerido: ${grupo.miembros.length}`
        };
      }

      // Asignar grupo al potrero
      potrero.gruposAsignados.push(grupoId);

      // Actualizar el grupo con el potrero asignado
      const grupoIdx = groups[cid].findIndex(g => g.id === grupoId);
      if (grupoIdx !== -1) {
        groups[cid][grupoIdx].potrero = potreroId;
      }

      // Recalcular ocupación actual basándose en grupos realmente asignados
      const gruposAsignados = groups[cid].filter(g =>
        potrero.gruposAsignados.includes(g.id)
      );
      potrero.ocupacionActual = gruposAsignados.reduce((total, grupo) => {
        return total + (grupo.miembros?.length || 0);
      }, 0);

      writeLS('potreros', potreros);
      writeLS('groups', groups);

      return { success: true, potrero, grupo };
    } catch (error) {
      console.error('Error al asignar grupo a potrero:', error);
      return { success: false, error: 'Error al asignar grupo' };
    }
  };

  // Función para recalcular la ocupación actual de un potrero basándose en los grupos asignados
  const recalculatePotreroOcupacion = (potreroId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return 0;

      const potreros = readLS('potreros', {});
      const groups = readLS('groups', {});

      if (!potreros[cid] || !groups[cid]) return 0;

      const potrero = potreros[cid].find(p => p.id === potreroId);
      if (!potrero) return 0;

      // Calcular ocupación basándose en los grupos realmente asignados
      const gruposAsignados = groups[cid].filter(g =>
        potrero.gruposAsignados.includes(g.id)
      );

      const ocupacionTotal = gruposAsignados.reduce((total, grupo) => {
        return total + (grupo.miembros?.length || 0);
      }, 0);

      return ocupacionTotal;
    } catch (error) {
      console.error('Error al recalcular ocupación:', error);
      return 0;
    }
  };

  // Función para sincronizar todas las ocupaciones de potreros
  const syncAllPotrerosOcupacion = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };

      const potreros = readLS('potreros', {});
      const groups = readLS('groups', {});

      if (!potreros[cid]) return { success: true, message: 'No hay potreros para sincronizar' };

      let cambiosRealizados = 0;

      potreros[cid] = potreros[cid].map(potrero => {
        const ocupacionAnterior = potrero.ocupacionActual;
        const ocupacionCalculada = recalculatePotreroOcupacion(potrero.id);

        if (ocupacionAnterior !== ocupacionCalculada) {
          cambiosRealizados++;
          return { ...potrero, ocupacionActual: ocupacionCalculada };
        }

        return potrero;
      });

      if (cambiosRealizados > 0) {
        writeLS('potreros', potreros);
      }

      return {
        success: true,
        message: `Sincronización completada. ${cambiosRealizados} potreros actualizados.`
      };
    } catch (error) {
      console.error('Error al sincronizar ocupaciones:', error);
      return { success: false, error: 'Error al sincronizar ocupaciones' };
    }
  };

  const removeGroupFromPotrero = (potreroId, grupoId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa' };

      const potreros = readLS('potreros', {});
      const groups = readLS('groups', {});

      if (!potreros[cid] || !groups[cid]) {
        return { success: false, error: 'No se encontraron datos' };
      }

      const potreroIdx = potreros[cid].findIndex(p => p.id === potreroId);
      const grupoIdx = groups[cid].findIndex(g => g.id === grupoId);

      if (potreroIdx === -1) return { success: false, error: 'Potrero no encontrado' };
      if (grupoIdx === -1) return { success: false, error: 'Grupo no encontrado' };

      const potrero = potreros[cid][potreroIdx];
      const grupo = groups[cid][grupoIdx];

      // Remover grupo del potrero
      potrero.gruposAsignados = potrero.gruposAsignados.filter(id => id !== grupoId);

      // Remover potrero del grupo
      groups[cid][grupoIdx].potrero = null;

      // Recalcular ocupación actual basándose en grupos realmente asignados
      const gruposAsignados = groups[cid].filter(g =>
        potrero.gruposAsignados.includes(g.id)
      );
      potrero.ocupacionActual = gruposAsignados.reduce((total, grupo) => {
        return total + (grupo.miembros?.length || 0);
      }, 0);

      writeLS('potreros', potreros);
      writeLS('groups', groups);

      return { success: true, potrero, grupo };
    } catch (error) {
      console.error('Error al remover grupo del potrero:', error);
      return { success: false, error: 'Error al remover grupo' };
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

  // (Opcional) editar/eliminar grupo
  const updateGroup = (groupId, updateData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };
      const groups = readLS('groups', {});
      if (!groups[cid]) return { success: false, error: 'No hay grupos' };

      const idx = groups[cid].findIndex(g => g.id === groupId);
      if (idx === -1) return { success: false, error: 'Grupo no encontrado' };

      const oldGroup = groups[cid][idx];
      const updatedGroup = {
        ...oldGroup,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'sistema'
      };

      groups[cid][idx] = updatedGroup;
      writeLS('groups', groups);

      // Si se actualizaron los miembros, sincronizar con los animales
      if (updateData.miembros !== undefined) {
        const livestock = readLS('livestock', {});
        if (livestock[cid]) {
          const oldMembers = new Set(oldGroup.miembros || []);
          const newMembers = new Set(updateData.miembros || []);

          livestock[cid] = livestock[cid].map(animal => {
            const animalId = animal.identificacion || animal.id;
            if (oldMembers.has(animalId) && !newMembers.has(animalId)) {
              return { ...animal, grupo: null };
            }
            if (newMembers.has(animalId) && !oldMembers.has(animalId)) {
              // remover de otros grupos
              const allGroups = groups[cid] || [];
              allGroups.forEach((g, gIdx) => {
                if (g.id !== groupId && g.miembros && g.miembros.includes(animalId)) {
                  groups[cid][gIdx].miembros = g.miembros.filter(id => id !== animalId);
                }
              });
              return { ...animal, grupo: groupId };
            }
            return animal;
          });

          writeLS('livestock', livestock);
          writeLS('groups', groups);
        }
      }

      return { success: true, group: updatedGroup };
    } catch (e) {
      console.error('Error al actualizar grupo:', e);
      return { success: false, error: 'Error al actualizar grupo' };
    }
  };

  const deleteGroup = (groupId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };
      const groups = readLS('groups', {});
      if (!groups[cid]) return { success: false, error: 'No hay grupos' };

      // Obtener información del grupo antes de eliminarlo
      const grupoAEliminar = groups[cid].find(g => g.id === groupId);
      if (!grupoAEliminar) return { success: false, error: 'Grupo no encontrado' };

      // Quitar grupo de los animales que lo tenían
      const livestock = readLS('livestock', {});
      if (livestock[cid]) {
        livestock[cid] = livestock[cid].map(a => (a.grupo === groupId ? { ...a, grupo: null } : a));
        writeLS('livestock', livestock);
      }

      // Quitar grupo de cualquier potrero que lo tuviera asignado
      const potreros = readLS('potreros', {});
      if (potreros[cid]) {
        potreros[cid] = potreros[cid].map(potrero => {
          if (potrero.gruposAsignados && potrero.gruposAsignados.includes(groupId)) {
            const gruposRestantes = potrero.gruposAsignados.filter(id => id !== groupId);
            const gruposAsignados = groups[cid].filter(g =>
              gruposRestantes.includes(g.id) && g.id !== groupId
            );
            const nuevaOcupacion = gruposAsignados.reduce((total, grupo) => {
              return total + (grupo.miembros?.length || 0);
            }, 0);
            return {
              ...potrero,
              gruposAsignados: gruposRestantes,
              ocupacionActual: nuevaOcupacion
            };
          }
          return potrero;
        });
        writeLS('potreros', potreros);
      }

      // Eliminar el grupo
      groups[cid] = groups[cid].filter(g => g.id !== groupId);
      writeLS('groups', groups);

      return { success: true };
    } catch (e) {
      console.error('Error al eliminar grupo:', e);
      return { success: false, error: 'Error al eliminar grupo' };
    }
  };

  // ====== CITAS VETERINARIAS ======
  // Lee TODAS las citas de todas las empresas
  const getAllCitas = () => {
    try {
      const mapa = readLS('citas', {}); // { companyId: [citas...] }
      const out = [];
      Object.entries(mapa).forEach(([companyId, arr]) => {
        (arr || []).forEach(c => out.push({ ...c, companyId }));
      });
      return out;
    } catch {
      return [];
    }
  };

  // Citas pendientes (sin veterinario asignado) en todo el sistema
  const getAllPendingCitas = () => {
    return getAllCitas().filter(c => !c.veterinarioEmail && (c.estado ?? 'pendiente') === 'pendiente');
  };

  // Citas asignadas a un veterinario (todas las empresas)
  const getAllVetCitas = (vetEmail) => {
    const email = (vetEmail || user?.email || '').toLowerCase();
    return getAllCitas().filter(c => (c.veterinarioEmail || '').toLowerCase() === email);
  };


  const getCompanyCitas = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return [];
      const citas = readLS('citas', {});
      return citas[cid] || [];
    } catch (e) {
      console.error('Error al obtener citas:', e);
      return [];
    }
  };

  const getCitaById = (citaId) => {
    const arr = getCompanyCitas();
    return arr.find(c => c.id === citaId) || null;
  };

  const addCita = (citaData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para agendar citas' };

      // Validaciones básicas
      if (!citaData.tipo || !citaData.servicio || !citaData.fechaCita) {
        return { success: false, error: 'Tipo, servicio y fecha son requeridos' };
      }

      const citas = readLS('citas', {});
      if (!citas[cid]) citas[cid] = [];

      const newCita = {
        id: `cita_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tipo: citaData.tipo, // 'individual' o 'grupo'
        objetivoId: citaData.objetivoId,
        objetivoNombre: citaData.objetivoNombre,
        servicio: citaData.servicio, // 'chequeo', 'vacunacion', 'desparasitacion'
        fechaCita: citaData.fechaCita,
        horaCita: citaData.horaCita || '09:00',
        observaciones: citaData.observaciones || '',
        estado: 'pendiente', // 'pendiente', 'aceptada', 'completada', 'cancelada', 'rechazada'
        veterinarioEmail: null, // se asigna al aceptar
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'sistema'
      };

      citas[cid] = [newCita, ...(citas[cid] || [])];
      writeLS('citas', citas);

      return { success: true, cita: newCita };
    } catch (error) {
      console.error('Error al crear cita:', error);
      return { success: false, error: 'Error interno al crear cita' };
    }
  };

  const updateCita = (citaId, updateData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };

      const citas = readLS('citas', {});
      if (!citas[cid]) return { success: false, error: 'No hay citas' };

      const idx = citas[cid].findIndex(c => c.id === citaId);
      if (idx === -1) return { success: false, error: 'Cita no encontrada' };

      const updatedCita = {
        ...citas[cid][idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'sistema'
      };

      citas[cid][idx] = updatedCita;
      writeLS('citas', citas);

      return { success: true, cita: updatedCita };
    } catch (e) {
      console.error('Error al actualizar cita:', e);
      return { success: false, error: 'Error al actualizar cita' };
    }
  };

  const setCitaEstado = (citaId, estado) => {
    return updateCita(citaId, { estado });
  };

  const acceptCita = (citaId, vetEmail) => {
  const email = (vetEmail || user?.email || '').toLowerCase().trim();
  if (!email) return { success: false, error: 'Veterinario no válido' };
  return updateCitaGlobal(citaId, { estado: 'aceptada', veterinarioEmail: email });
};

const completeCita = (citaId) => {
  return updateCitaGlobal(citaId, { estado: 'completada' });
};

const rejectCita = (citaId) => {
  // Rechazar y liberar para que vuelva a "disponible"
  return updateCitaGlobal(citaId, { estado: 'rechazada', veterinarioEmail: null });
};

const rescheduleCita = (citaId, { fechaCita, horaCita, observaciones }) => {
  const patch = {};
  if (fechaCita) patch.fechaCita = fechaCita;
  if (horaCita) patch.horaCita = horaCita;
  if (observaciones !== undefined) patch.observaciones = observaciones;
  return updateCitaGlobal(citaId, patch);
};

const cancelCita = (citaId) => {
  return cancelCitaGlobal(citaId);
};


  const deleteCita = (citaId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };

      const citas = readLS('citas', {});
      if (!citas[cid]) return { success: false, error: 'No hay citas' };

      citas[cid] = citas[cid].filter(c => c.id !== citaId);
      writeLS('citas', citas);

      return { success: true };
    } catch (e) {
      console.error('Error al eliminar cita:', e);
      return { success: false, error: 'Error al eliminar cita' };
    }
  };

  const getVetCitas = (vetEmail) => {
    const email = toEmail(vetEmail || user?.email);
    const all = getCompanyCitas();
    return all.filter(c => toEmail(c.veterinarioEmail) === email);
  };


  // === Helpers globales para CITAS (todas las empresas) ===
  const findCitaAcrossCompanies = (citaId) => {
    const mapa = readLS('citas', {}); // { companyId: [citas...] }
    for (const [cid, arr] of Object.entries(mapa)) {
      const idx = (arr || []).findIndex(c => c.id === citaId);
      if (idx !== -1) return { mapa, cid, idx };
    }
    return { mapa: null, cid: null, idx: -1 };
  };

  const updateCitaGlobal = (citaId, patch) => {
    try {
      const { mapa, cid, idx } = findCitaAcrossCompanies(citaId);
      if (!mapa || idx === -1) return { success: false, error: 'Cita no encontrada (global)' };

      const updated = {
        ...mapa[cid][idx],
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'sistema',
      };

      mapa[cid][idx] = updated;
      writeLS('citas', mapa);
      return { success: true, cita: updated, companyId: cid };
    } catch (e) {
      console.error('updateCitaGlobal error:', e);
      return { success: false, error: 'Error global al actualizar cita' };
    }
  };

  const cancelCitaGlobal = (citaId) => {
    return updateCitaGlobal(citaId, {
      estado: 'cancelada',
      canceladaAt: new Date().toISOString(),
      canceladaBy: user?.email || 'sistema',
    });
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
    updateMedicalInfo,
    deleteAnimal,

    // Potreros
    getCompanyPotreros,
    addPotrero,
    getPotreroById,
    assignGroupToPotrero,
    removeGroupFromPotrero,
    recalculatePotreroOcupacion,
    syncAllPotrerosOcupacion,

    // Grupos
    getCompanyGroups,
    addGroup,
    checkGroupExists,
    listAnimals,
    updateGroup,
    deleteGroup,

    // Citas Veterinarias
    getAllCitas,
    getAllPendingCitas,
    getAllVetCitas,

    getCompanyCitas,
    getCitaById,
    getVetCitas,
    addCita,
    updateCita,
    setCitaEstado,
    acceptCita,
    completeCita,
    rejectCita,
    rescheduleCita,
    cancelCita,
    deleteCita,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
