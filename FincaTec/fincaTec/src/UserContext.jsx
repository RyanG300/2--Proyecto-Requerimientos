import React, { createContext, useContext, useState, useEffect } from 'react';

/* ===================== CONTEXTO Y HOOK ===================== */
const UserContext = createContext();

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe ser usado dentro de un UserProvider');
  return ctx;
};

/* ===================== HELPERS ===================== */
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

/* ===================== PROVIDER ===================== */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- cargar usuario ---------- */
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

  /* ===================== AUTENTICACIÓN ===================== */
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

  /* ===================== EMPRESAS ===================== */
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

  /* ===================== UTILIDADES EMPRESA ===================== */
  const getCompanyId = () => {
    const c = getUserCompany();
    return c?.id || null;
  };

  /* ===================== SISTEMA DE AUDITORÍA ===================== */
  const addAuditLog = (action, details) => {
    try {
      const cid = getCompanyId();
      if (!cid || !user) return;

      const logs = readLS('auditLogs', {});
      if (!logs[cid]) logs[cid] = [];

      const logEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        user: user.name || user.email,
        userEmail: user.email,
        action,
        details,
        companyId: cid
      };

      logs[cid].push(logEntry);
      
      // Mantener solo los últimos 100 logs por empresa
      if (logs[cid].length > 100) {
        logs[cid] = logs[cid].slice(-100);
      }

      writeLS('auditLogs', logs);
    } catch (e) {
      console.error('Error al registrar acción de auditoría:', e);
    }
  };

  const getCompanyAuditLogs = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return [];
      const logs = readLS('auditLogs', {});
      return (logs[cid] || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      console.error('Error al obtener logs de auditoría:', e);
      return [];
    }
  };

  /* ===================== GANADO ===================== */
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

      // Registrar en auditoría
      addAuditLog('ANIMAL_ADDED', `Agregó un nuevo animal: ${animalData.nombre} (ID: ${animalData.identificacion}), Especie: ${animalData.especie}`);

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

      livestock[cid][idx] = {
        ...oldAnimal,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      };
      writeLS('livestock', livestock);

      if (oldGroup !== newGroup) {
        const groups = readLS('groups', {});
        if (groups[cid]) {
          if (oldGroup) {
            const oldGroupIdx = groups[cid].findIndex(g => g.id === oldGroup);
            if (oldGroupIdx !== -1) {
              groups[cid][oldGroupIdx].miembros = (groups[cid][oldGroupIdx].miembros || [])
                .filter(id => id !== animalId);
            }
          }
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
          
          // Registrar en auditoría el cambio de grupo
          const animalName = livestock[cid][idx].nombre || animalId;
          if (oldGroup && newGroup) {
            addAuditLog('ANIMAL_GROUP_CHANGED', `Movió el animal "${animalName}" del grupo "${oldGroup}" al grupo "${newGroup}"`);
          } else if (oldGroup && !newGroup) {
            addAuditLog('ANIMAL_REMOVED_FROM_GROUP', `Removió el animal "${animalName}" del grupo "${oldGroup}"`);
          } else if (!oldGroup && newGroup) {
            addAuditLog('ANIMAL_ADDED_TO_GROUP', `Agregó el animal "${animalName}" al grupo "${newGroup}"`);
          }
        }
      } else if (updateData.nombre && updateData.nombre !== oldAnimal.nombre) {
        // Registrar cambios de nombre
        addAuditLog('ANIMAL_UPDATED', `Cambió el nombre del animal de "${oldAnimal.nombre}" a "${updateData.nombre}"`);
      } else if (Object.keys(updateData).length > 0) {
        // Otros cambios generales
        addAuditLog('ANIMAL_UPDATED', `Actualizó la información del animal "${livestock[cid][idx].nombre}"`);
      }

      return { success: true, animal: livestock[cid][idx] };
    } catch (error) {
      console.error('Error al actualizar animal:', error);
      return { success: false, error: 'Error al actualizar el animal' };
    }
  };

  /* ==== Información médica (local) con normalización de arrays ==== */
  const updateMedicalInfo = (animalId, medicalData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para actualizar información médica' };

      const livestock = readLS('livestock', {});
      if (!livestock[cid]) return { success: false, error: 'No se encontraron animales' };

      const idx = livestock[cid].findIndex(a => (a.identificacion || a.id) === animalId);
      if (idx === -1) return { success: false, error: 'Animal no encontrado' };

      const prev = livestock[cid][idx].informacionMedica || {};
      const norm = {
        historialVacunas: Array.isArray(prev.historialVacunas) ? prev.historialVacunas : [],
        historialEnfermedades: Array.isArray(prev.historialEnfermedades) ? prev.historialEnfermedades : [],
        proximasVacunas: Array.isArray(prev.proximasVacunas) ? prev.proximasVacunas : [],
        tratamientosActivos: Array.isArray(prev.tratamientosActivos) ? prev.tratamientosActivos : [],
        ...prev,
        ...medicalData,
      };

      livestock[cid][idx] = {
        ...livestock[cid][idx],
        informacionMedica: {
          ...norm,
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

      // Buscar el animal antes de eliminarlo para el log
      const animal = livestock[cid].find(a => a.id === animalId);
      const animalName = animal ? animal.nombre : animalId;

      livestock[cid] = livestock[cid].filter(a => a.id !== animalId);
      writeLS('livestock', livestock);

      // Registrar en auditoría
      addAuditLog('ANIMAL_DELETED', `Eliminó el animal: ${animalName} (ID: ${animalId})`);

      return { success: true };
    } catch (error) {
      console.error('Error al eliminar animal:', error);
      return { success: false, error: 'Error al eliminar el animal' };
    }
  };

  /* ===================== POTREROS ===================== */
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

      // Registrar en auditoría
      addAuditLog('POTRERO_ADDED', `Agregó un nuevo potrero: ${potreroData.nombre} (Capacidad: ${potreroData.capacidad}, Ubicación: ${potreroData.provincia}, ${potreroData.canton})`);

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
      if (!potreros[cid] || !groups[cid]) return { success: false, error: 'No se encontraron datos' };

      const potreroIdx = potreros[cid].findIndex(p => p.id === potreroId);
      const grupo = groups[cid].find(g => g.id === grupoId);
      if (potreroIdx === -1) return { success: false, error: 'Potrero no encontrado' };
      if (!grupo) return { success: false, error: 'Grupo no encontrado' };

      const potrero = potreros[cid][potreroIdx];

      if (potrero.gruposAsignados.includes(grupoId)) {
        return { success: false, error: 'El grupo ya está asignado a este potrero' };
      }

      const nuevaOcupacion = potrero.ocupacionActual + (grupo.miembros?.length || 0);
      if (nuevaOcupacion > potrero.capacidad) {
        return { success: false, error: `No hay suficiente capacidad. Disponible: ${potrero.capacidad - potrero.ocupacionActual}, Requerido: ${grupo.miembros?.length || 0}` };
      }

      potrero.gruposAsignados.push(grupoId);

      const grupoIdx = groups[cid].findIndex(g => g.id === grupoId);
      if (grupoIdx !== -1) groups[cid][grupoIdx].potrero = potreroId;

      const gruposAsignados = groups[cid].filter(g => potrero.gruposAsignados.includes(g.id));
      potrero.ocupacionActual = gruposAsignados.reduce((t, g) => t + (g.miembros?.length || 0), 0);

      writeLS('potreros', potreros);
      writeLS('groups', groups);

      // Registrar en auditoría
      addAuditLog('GROUP_ASSIGNED', `Asignó el grupo "${grupo.nombre}" (${grupo.miembros?.length || 0} animales) al potrero "${potrero.nombre}"`);

      return { success: true, potrero, grupo };
    } catch (error) {
      console.error('Error al asignar grupo a potrero:', error);
      return { success: false, error: 'Error al asignar grupo' };
    }
  };

  const recalculatePotreroOcupacion = (potreroId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return 0;

      const potreros = readLS('potreros', {});
      const groups = readLS('groups', {});
      if (!potreros[cid] || !groups[cid]) return 0;

      const potrero = potreros[cid].find(p => p.id === potreroId);
      if (!potrero) return 0;

      const gruposAsignados = groups[cid].filter(g => potrero.gruposAsignados.includes(g.id));
      const ocupacionTotal = gruposAsignados.reduce((t, g) => t + (g.miembros?.length || 0), 0);
      return ocupacionTotal;
    } catch (error) {
      console.error('Error al recalcular ocupación:', error);
      return 0;
    }
  };

  const syncAllPotrerosOcupacion = () => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };

      const potreros = readLS('potreros', {});
      if (!potreros[cid]) return { success: true, message: 'No hay potreros para sincronizar' };

      let cambios = 0;
      potreros[cid] = potreros[cid].map(p => {
        const anterior = p.ocupacionActual;
        const calculada = recalculatePotreroOcupacion(p.id);
        if (anterior !== calculada) {
          cambios++;
          return { ...p, ocupacionActual: calculada };
        }
        return p;
      });

      if (cambios > 0) writeLS('potreros', potreros);
      return { success: true, message: `Sincronización completada. ${cambios} potreros actualizados.` };
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
      if (!potreros[cid] || !groups[cid]) return { success: false, error: 'No se encontraron datos' };

      const potreroIdx = potreros[cid].findIndex(p => p.id === potreroId);
      const grupoIdx = groups[cid].findIndex(g => g.id === grupoId);
      if (potreroIdx === -1) return { success: false, error: 'Potrero no encontrado' };
      if (grupoIdx === -1) return { success: false, error: 'Grupo no encontrado' };

      const potrero = potreros[cid][potreroIdx];
      groups[cid][grupoIdx].potrero = null;
      potrero.gruposAsignados = potrero.gruposAsignados.filter(id => id !== grupoId);

      const gruposAsignados = groups[cid].filter(g => potrero.gruposAsignados.includes(g.id));
      potrero.ocupacionActual = gruposAsignados.reduce((t, g) => t + (g.miembros?.length || 0), 0);

      writeLS('potreros', potreros);
      writeLS('groups', groups);

      // Registrar en auditoría
      const grupo = groups[cid][grupoIdx];
      addAuditLog('GROUP_REMOVED_FROM_POTRERO', `Removió el grupo "${grupo.nombre}" (${grupo.miembros?.length || 0} animales) del potrero "${potrero.nombre}"`);

      return { success: true, potrero, grupo: groups[cid][grupoIdx] };
    } catch (error) {
      console.error('Error al remover grupo del potrero:', error);
      return { success: false, error: 'Error al remover grupo' };
    }
  };

  /* ===================== GRUPOS ===================== */
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

      // Registrar en auditoría
      addAuditLog('GROUP_CREATED', `Creó el grupo de pastoreo "${newGroup.nombre}" (ID: ${id}) con ${newGroup.miembros.length} miembros`);

      return { success: true, group: newGroup };
    } catch (error) {
      console.error('Error al crear grupo:', error);
      return { success: false, error: 'Error interno al crear grupo' };
    }
  };

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

      // Registrar en auditoría cambios de miembros
      if (updateData.miembros !== undefined) {
        const oldMembers = new Set(oldGroup.miembros || []);
        const newMembers = new Set(updateData.miembros || []);
        
        const removedMembers = [...oldMembers].filter(id => !newMembers.has(id));
        const addedMembers = [...newMembers].filter(id => !oldMembers.has(id));
        
        if (removedMembers.length > 0 || addedMembers.length > 0) {
          let details = `Modificó los miembros del grupo "${updatedGroup.nombre}": `;
          if (addedMembers.length > 0) {
            details += `Agregó ${addedMembers.length} animales (${addedMembers.join(', ')})`;
          }
          if (removedMembers.length > 0) {
            if (addedMembers.length > 0) details += '; ';
            details += `Removió ${removedMembers.length} animales (${removedMembers.join(', ')})`;
          }
          addAuditLog('GROUP_MEMBERS_UPDATED', details);
        }
      } else {
        addAuditLog('GROUP_UPDATED', `Actualizó el grupo "${updatedGroup.nombre}"`);
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

      const grupoAEliminar = groups[cid].find(g => g.id === groupId);
      if (!grupoAEliminar) return { success: false, error: 'Grupo no encontrado' };

      const livestock = readLS('livestock', {});
      if (livestock[cid]) {
        livestock[cid] = livestock[cid].map(a => (a.grupo === groupId ? { ...a, grupo: null } : a));
        writeLS('livestock', livestock);
      }

      const potreros = readLS('potreros', {});
      if (potreros[cid]) {
        potreros[cid] = potreros[cid].map(potrero => {
          if (potrero.gruposAsignados && potrero.gruposAsignados.includes(groupId)) {
            const gruposRestantes = potrero.gruposAsignados.filter(id => id !== groupId);
            const gruposAsignados = groups[cid].filter(g => gruposRestantes.includes(g.id) && g.id !== groupId);
            const nuevaOcupacion = gruposAsignados.reduce((t, g) => t + (g.miembros?.length || 0), 0);
            return { ...potrero, gruposAsignados: gruposRestantes, ocupacionActual: nuevaOcupacion };
          }
          return potrero;
        });
        writeLS('potreros', potreros);
      }

      groups[cid] = groups[cid].filter(g => g.id !== groupId);
      writeLS('groups', groups);

      // Registrar en auditoría
      addAuditLog('GROUP_DELETED', `Eliminó el grupo "${grupoAEliminar.nombre}" que contenía ${grupoAEliminar.miembros?.length || 0} animales`);

      return { success: true };
    } catch (e) {
      console.error('Error al eliminar grupo:', e);
      return { success: false, error: 'Error al eliminar grupo' };
    }
  };

  /* ===================== CITAS VETERINARIAS ===================== */
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

  const addCita = (citaData) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Debes pertenecer a una empresa para agendar citas' };
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
        estado: 'pendiente', // 'pendiente', 'aceptada', 'completada', 'cancelada'
        veterinarioEmail: null, // se asigna cuando un veterinario acepta
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'sistema'
      };

      citas[cid] = [newCita, ...(citas[cid] || [])];
      writeLS('citas', citas);

      // Registrar en auditoría
      const servicioText = citaData.servicio === 'chequeo' ? 'Chequeo médico' : 
                          citaData.servicio === 'vacunacion' ? 'Vacunación' : 
                          citaData.servicio === 'desparasitacion' ? 'Desparasitación' : citaData.servicio;
      addAuditLog('CITA_SCHEDULED', `Agendó cita veterinaria: ${servicioText} para "${citaData.objetivoNombre}" el ${new Date(citaData.fechaCita).toLocaleDateString()}`);

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

  const cancelCita = (citaId) => {
    try {
      // cancelar independientemente de empresa (útil para vet)
      const citas = readLS('citas', {});
      let found = false;
      for (const cid of Object.keys(citas)) {
        const idx = (citas[cid] || []).findIndex(c => c.id === citaId);
        if (idx !== -1) {
          citas[cid][idx] = {
            ...citas[cid][idx],
            estado: 'cancelada',
            canceladaAt: new Date().toISOString(),
            canceladaBy: user?.email || 'sistema'
          };
          found = true;
          break;
        }
      }
      if (!found) return { success: false, error: 'Cita no encontrada' };
      writeLS('citas', citas);
      return { success: true };
    } catch (e) {
      console.error('Error al cancelar cita:', e);
      return { success: false, error: 'Error al cancelar cita' };
    }
  };

  const deleteCita = (citaId) => {
    try {
      const cid = getCompanyId();
      if (!cid) return { success: false, error: 'Sin empresa' };

      const citas = readLS('citas', {});
      if (!citas[cid]) return { success: false, error: 'No hay citas' };

      // Buscar la cita antes de eliminarla para el log
      const cita = citas[cid].find(c => c.id === citaId);
      const citaName = cita ? cita.objetivoNombre : citaId;

      citas[cid] = citas[cid].filter(c => c.id !== citaId);
      writeLS('citas', citas);

      // Registrar en auditoría
      addAuditLog('CITA_CANCELLED', `Canceló la cita veterinaria para "${citaName}"`);

      return { success: true };
    } catch (e) {
      console.error('Error al eliminar cita:', e);
      return { success: false, error: 'Error al eliminar cita' };
    }
  };

  /* ---- Funciones extra para PERFIL DEL VETERINARIO ---- */

  // Todas las citas "pendientes" de TODAS las empresas (sin vet asignado)
  const getAllPendingCitas = () => {
    const citas = readLS('citas', {});
    const arr = [];
    Object.entries(citas).forEach(([cid, cs]) => {
      (cs || []).forEach(c => {
        if (c.estado === 'pendiente' && !c.veterinarioEmail) {
          arr.push({ ...c, companyId: cid });
        }
      });
    });
    // ordenar por fecha
    arr.sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));
    return arr;
  };

  // Citas asignadas al veterinario (de todas las empresas)
  const getAllVetCitas = (vetEmail) => {
    const citas = readLS('citas', {});
    const arr = [];
    Object.entries(citas).forEach(([cid, cs]) => {
      (cs || []).forEach(c => {
        if (c.veterinarioEmail === vetEmail && c.estado !== 'cancelada') {
          arr.push({ ...c, companyId: cid });
        }
      });
    });
    arr.sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita));
    return arr;
  };

  // Aceptar (asignar) una cita
  const acceptCita = (citaId) => {
    try {
      const citas = readLS('citas', {});
      let saved = false;
      for (const cid of Object.keys(citas)) {
        const idx = (citas[cid] || []).findIndex(c => c.id === citaId);
        if (idx !== -1) {
          const target = citas[cid][idx];
          if (target.estado === 'cancelada' || target.estado === 'completada') {
            return { success: false, error: 'La cita ya no está disponible' };
          }
          citas[cid][idx] = {
            ...target,
            estado: 'aceptada',
            veterinarioEmail: user?.email || target.veterinarioEmail,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.email || 'sistema'
          };
          saved = true;
          break;
        }
      }
      if (!saved) return { success: false, error: 'Cita no encontrada' };
      writeLS('citas', citas);
      return { success: true };
    } catch (e) {
      console.error('acceptCita error:', e);
      return { success: false, error: 'No se pudo aceptar la cita' };
    }
  };

  // Completar una cita
  const completeCita = (citaId) => {
    try {
      const citas = readLS('citas', {});
      let saved = false;
      for (const cid of Object.keys(citas)) {
        const idx = (citas[cid] || []).findIndex(c => c.id === citaId);
        if (idx !== -1) {
          citas[cid][idx] = {
            ...citas[cid][idx],
            estado: 'completada',
            completadaAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: user?.email || 'sistema'
          };
          saved = true;
          break;
        }
      }
      if (!saved) return { success: false, error: 'Cita no encontrada' };
      writeLS('citas', citas);
      return { success: true };
    } catch (e) {
      console.error('completeCita error:', e);
      return { success: false, error: 'No se pudo completar la cita' };
    }
  };

  // Rechazar (liberar) una cita que ya estaba asignada al vet
  const rejectCita = (citaId) => {
    try {
      const citas = readLS('citas', {});
      let saved = false;
      for (const cid of Object.keys(citas)) {
        const idx = (citas[cid] || []).findIndex(c => c.id === citaId);
        if (idx !== -1) {
          const target = citas[cid][idx];
          citas[cid][idx] = {
            ...target,
            estado: 'pendiente',
            veterinarioEmail: null,
            updatedAt: new Date().toISOString(),
            updatedBy: user?.email || 'sistema'
          };
          saved = true;
          break;
        }
      }
      if (!saved) return { success: false, error: 'Cita no encontrada' };
      writeLS('citas', citas);
      return { success: true };
    } catch (e) {
      console.error('rejectCita error:', e);
      return { success: false, error: 'No se pudo rechazar la cita' };
    }
  };

  /* ===================== FUNCIONES GLOBALES (multi-empresa) ===================== */
  const findAnimalAcrossCompanies = (animalId) => {
    const livestock = readLS('livestock', {}); // { companyId: [animales...] }
    for (const [cid, arr] of Object.entries(livestock)) {
      const idx = (arr || []).findIndex(a => (a.identificacion || a.id) === animalId);
      if (idx !== -1) return { livestock, cid, idx };
    }
    return { livestock: null, cid: null, idx: -1 };
  };

  const getAnimalAcrossCompanies = (animalId) => {
    const { livestock, cid, idx } = findAnimalAcrossCompanies(animalId);
    if (!livestock || idx === -1) return null;
    return { ...livestock[cid][idx], companyId: cid };
  };

  const updateMedicalInfoGlobal = (animalId, medicalData) => {
    try {
      const { livestock, cid, idx } = findAnimalAcrossCompanies(animalId);
      if (!livestock || idx === -1) return { success: false, error: 'Animal no encontrado (global)' };

      const prev = livestock[cid][idx].informacionMedica || {};
      const norm = {
        historialVacunas: Array.isArray(prev.historialVacunas) ? prev.historialVacunas : [],
        historialEnfermedades: Array.isArray(prev.historialEnfermedades) ? prev.historialEnfermedades : [],
        proximasVacunas: Array.isArray(prev.proximasVacunas) ? prev.proximasVacunas : [],
        tratamientosActivos: Array.isArray(prev.tratamientosActivos) ? prev.tratamientosActivos : [],
        ...prev,
        ...medicalData,
      };

      livestock[cid][idx] = {
        ...livestock[cid][idx],
        informacionMedica: {
          ...norm,
          fechaUltimaActualizacion: new Date().toISOString(),
          actualizadoPor: user?.email || 'sistema',
        },
        updatedAt: new Date().toISOString(),
        updatedBy: user?.email || 'sistema',
      };

      writeLS('livestock', livestock);
      return { success: true, animal: livestock[cid][idx], companyId: cid };
    } catch (e) {
      console.error('updateMedicalInfoGlobal error:', e);
      return { success: false, error: 'Error al actualizar información médica (global)' };
    }
  };

  /* ===================== VALUE ===================== */
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

    // Citas Veterinarias (empresa actual)
    getCompanyCitas,
    addCita,
    updateCita,
    cancelCita,
    deleteCita,

    // Citas para PERFIL VETERINARIO (multi-empresa)
    getAllPendingCitas,
    getAllVetCitas,
    acceptCita,
    completeCita,
    rejectCita,

    // Funciones globales (multi-empresa)
    getAnimalAcrossCompanies,
    updateMedicalInfoGlobal,

    // Sistema de auditoría
    getCompanyAuditLogs,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
