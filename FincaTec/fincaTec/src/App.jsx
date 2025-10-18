// src/App.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, logout, getUserCompany, getCompanyLivestock, getCompanyGroups, getCompanyPotreros, syncAllPotrerosOcupacion, getCompanyCitas, cancelCita, deleteCita, isCompanyOwner } = useUser();

  const [companyLivestock, setCompanyLivestock] = useState([]);
  const [companyGroups, setCompanyGroups] = useState([]);
  const [companyPotreros, setCompanyPotreros] = useState([]);
  const [companyCitas, setCompanyCitas] = useState([]);
  const [userCompany, setUserCompany] = useState(null);

  // Cargar datos al montar / cuando cambie el usuario
  useEffect(() => {
    const company = getUserCompany();
    const livestock = getCompanyLivestock();
    const groups = getCompanyGroups ? getCompanyGroups() : [];
    const potreros = getCompanyPotreros ? getCompanyPotreros() : [];
    const citas = getCompanyCitas ? getCompanyCitas() : [];

    setUserCompany(company);
    setCompanyLivestock(livestock);
    setCompanyGroups(groups);
    setCompanyPotreros(potreros);
    setCompanyCitas(citas);
  }, [user, getUserCompany, getCompanyLivestock, getCompanyGroups, getCompanyPotreros, getCompanyCitas]);

  // Logout
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      navigate('/');
    }
  };

  const handleCompanyView = () => navigate('/company-view');
  const handleGoToProfile = () => navigate('/perfil');

  // Función para sincronizar potreros
  const handleSyncPotreros = async () => {
    try {
      const result = syncAllPotrerosOcupacion();
      if (result.success) {
        alert(result.message);
        // Recargar datos de potreros después de la sincronización
        const updatedPotreros = getCompanyPotreros();
        setCompanyPotreros(updatedPotreros);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
      alert('Error inesperado al sincronizar');
    }
  };

  // Función para cancelar cita
  const handleCancelCita = (citaId) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      try {
        const result = deleteCita(citaId);
        if (result.success) {
          alert('Cita cancelada exitosamente');
          // Eliminar la cita del estado local inmediatamente
          setCompanyCitas(prevCitas => 
            prevCitas.filter(cita => cita.id !== citaId)
          );
        } else {
          alert(`Error: ${result.error}`);
        }
      } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert('Error inesperado al cancelar la cita');
      }
    }
  };



  // Filtrar ganado por búsqueda
  const filteredLivestock = companyLivestock.filter(animal =>
    animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.raza.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Si no hay empresa
  if (!userCompany) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-red-400 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Acceso Restringido</h2>
          <p className="text-gray-700 mb-6">
            Para acceder a esta aplicación, primero debes pertenecer a una empresa ganadera.
          </p>
          <button
            onClick={() => navigate('/company-view')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
          >
            Gestionar Empresa
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-green-500 via-green-400 to-green-300 shadow-md">
          <img src="/images/Menu_finquero/icono_FincaTec.png" alt="FincaTec Logo" />

         

          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-green-200 via-green-100 to-green-300 shadow-lg border border-green-400">
              <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg>
              <span className="text-xl font-bold text-green-900 tracking-wide">
                ¡Bienvenido, {user?.name || user?.email || 'Usuario'}!
              </span>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={handleGoToProfile} className="bg-white hover:bg-blue-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition">
              <img src="images/Menu_finqueros/icono_perfil.png" alt="Perfil" className="w-10 h-10" />
              <span className="font-bold text-green-700">Perfil</span>
            </button>
            <button onClick={handleCompanyView} className="bg-white hover:bg-blue-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition">
              <img src="images/Menu_finqueros/icono_volver.png" alt="Volver" className="w-10 h-10" />
              <span className="font-bold text-green-700">Volver</span>
            </button>
            <button onClick={handleLogout} className="bg-white hover:bg-red-200 rounded-xl flex flex-col items-center shadow px-2 py-1 transition">
              <img src="images/Menu_finqueros/icono_salir.png" alt="Salir" className="w-10 h-10" />
              <span className="font-bold text-green-700">Salir</span>
            </button>
          </div>
        </header>

        {/* Información empresa */}
        <section className="mx-auto mt-6 mb-8 max-w-3xl w-full bg-white rounded-xl shadow-lg border-2 border-green-400 flex items-center gap-6 px-8 py-6">
          <img src={userCompany?.photo || "images/Menu_finqueros/icono_FincaTec.png"} alt="Logo FincaTec" className="w-24 h-24 rounded-2xl border border-green-300" />
          <div>
            <h2 className="text-2xl font-bold text-green-700">{userCompany?.name || 'Empresa Ganadera'}</h2>
            <p className="text-gray-700 mt-2">
              {userCompany?.description || 'Empresa dedicada a la producción y comercialización de ganado de alta calidad.'}
            </p>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">Ubicación:</span> {userCompany?.location || 'No especificada'} |
              <span className="font-semibold ml-2">Ganado:</span> {companyLivestock.length} cabezas |
              <span className="font-semibold ml-2">Potreros:</span> {companyPotreros.length} |
              <span className="font-semibold ml-2">Citas pendientes:</span> {companyCitas.filter(c => c.estado === 'pendiente').length}
            </div>
          </div>
        </section>

        {/* Contenedores principales */}
        <main className="flex flex-col items-center gap-8">
          {/* Rectángulos superiores */}
          <div className="flex flex-row justify-between w-full max-w-6xl mx-auto gap-12">
            {/* Contenedor de ganado */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[600px] flex flex-col items-center p-8">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-700">Cabezas de ganado</span>
                <button onClick={() => navigate('/add-ganado')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">
                  Añadir cabeza de ganado
                </button>
              </div>
              <div className="w-full flex items-center border-2 border-green-300 rounded-lg mb-4 px-2 py-1 bg-gray-50">
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID, especie o raza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none px-2"
                />
                <button className="p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </button>
              </div>

              <div className="w-full flex-1 overflow-y-auto">
                {filteredLivestock.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {companyLivestock.length === 0
                      ? 'No hay ganado registrado en tu empresa'
                      : 'No se encontraron resultados'}
                  </div>
                ) : (
                  filteredLivestock.map((animal) => (
                    <div key={animal.id} className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                      <img
                        src={animal.foto}
                        alt={animal.nombre}
                        className="w-20 h-20 object-cover rounded-lg border border-green-300"
                        onError={(e) => { e.target.src = '/images/Ganado_Relleno/animal_default.png'; }}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-green-800">Nombre: {animal.nombre}</div>
                        <div className="text-sm text-gray-700">ID: {animal.id}</div>
                        <div className="text-sm text-gray-700">Especie: {animal.especie}</div>
                        <div className="text-sm text-gray-700">Raza: {animal.raza}</div>
                        <div className="text-sm text-gray-700">Sexo: {animal.sexo}</div>
                        <div className="text-sm text-gray-700">Peso: {animal.peso} kg</div>
                      </div>
                      <button
                        onClick={() => navigate(`/visualizar-ganado/${animal.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                      >
                        Visualizar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Contenedor de potreros */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[600px] flex flex-col items-center p-8">
              <div className="w-full flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-green-700">Potreros / Lotes</span>
                {isCompanyOwner() ? (
                  <button onClick={() => navigate('/add-potreros')} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition">Añadir potrero</button>
                ) : (
                  <span className="text-sm text-gray-500 italic">Solo el propietario puede añadir potreros</span>
                )}
              </div>
              
              {/* Botón de sincronización - Solo para propietarios */}
              {isCompanyOwner() && (
                <div className="w-full mb-4">
                  <button 
                    onClick={handleSyncPotreros}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition text-sm"
                  >
                    🔄 Sincronizar ocupaciones
                  </button>
                </div>
              )}

              <div className="w-full flex-1 overflow-y-auto">
                {companyPotreros.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay potreros registrados en tu empresa
                  </div>
                ) : (
                  companyPotreros.map((potrero) => (
                    <div key={potrero.id} className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                      <img
                        src={potrero.foto || '/images/Potreros_relleno/potrero_1.png'}
                        alt={potrero.nombre}
                        className="w-20 h-20 object-cover rounded-lg border border-green-300"
                        onError={(e) => { e.target.src = '/images/Potreros_relleno/potrero_1.png'; }}
                      />
                      <div className="flex-1">
                        <div className="font-bold text-green-800">Nombre: {potrero.nombre}</div>
                        <div className="text-sm text-gray-700">Capacidad: {potrero.capacidad} cabezas</div>
                        <div className="text-sm text-gray-700">Ocupación: {potrero.ocupacionActual}/{potrero.capacidad}</div>
                        <div className="text-sm text-gray-700">Ubicación: {potrero.provincia}, {potrero.canton}</div>
                        <div className="text-sm text-gray-700">Estado: 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                            potrero.estado === 'Excelente calidad' ? 'bg-green-200 text-green-800' :
                            potrero.estado === 'Buen estado' ? 'bg-blue-200 text-blue-800' :
                            potrero.estado === 'Estado decente' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {potrero.estado}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/visualizar-potrero/${potrero.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                      >
                        Visualizar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Nueva fila inferior */}
          <div className="flex flex-row justify-between w-full max-w-6xl mx-auto gap-12">
            {/* Rectángulo de grupos de pastoreo */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[400px] flex flex-col items-center p-8">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-700">Grupos de pastoreo</span>
                <button
                  onClick={() => navigate('/add-grupos')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  Crear grupo
                </button>
              </div>

              {/* Lista dinámica de grupos */}
              <div className="w-full flex-1 overflow-y-auto">
                {companyGroups.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay grupos registrados. Crea uno nuevo para empezar.
                  </p>
                ) : (
                  companyGroups.map((grupo) => (
                    <div key={grupo.id} className="flex items-center gap-4 bg-green-50 rounded-lg p-3 mb-4 shadow">
                      <div className="flex-1">
                        <div className="font-bold text-green-800">ID Grupo: {grupo.id}</div>
                        <div className="text-sm text-gray-700">Especie: {grupo.especie}</div>
                      </div>
                      <button
                        onClick={() => navigate(`/visualizar-grupos-pastoreo/${grupo.id}`)} // 👈 usar el ID del grupo
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                      >
                        Visualizar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Citas veterinarias */}
            <section className="bg-white rounded-xl shadow-lg border-2 border-green-400 w-[520px] h-[400px] flex flex-col items-center p-8">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-green-700">Citas Veterinarias</span>
                {isCompanyOwner() ? (
                  <button
                    onClick={() => navigate('/agendar-cita')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
                  >
                    Agendar cita
                  </button>
                ) : (
                  <span className="text-sm text-gray-500 italic">Solo el propietario puede agendar citas</span>
                )}
              </div>



              {/* Lista dinámica de citas */}
              <div className="w-full flex-1 overflow-y-auto">
                {companyCitas.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay citas programadas. Agenda una nueva cita veterinaria.
                  </p>
                ) : (
                  companyCitas
                    .sort((a, b) => new Date(a.fechaCita) - new Date(b.fechaCita)) // Ordenar por fecha
                    .map((cita) => {
                      const fechaCita = new Date(cita.fechaCita);
                      const esProxima = fechaCita >= new Date().setHours(0, 0, 0, 0);
                      
                      return (
                        <div key={cita.id} className="bg-green-50 rounded-lg p-3 mb-3 shadow border">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-green-800 text-sm">
                                {cita.objetivoNombre}
                              </div>
                              <div className="text-xs text-gray-600">
                                {cita.servicio === 'chequeo' ? 'Chequeo médico' :
                                 cita.servicio === 'vacunacion' ? 'Vacunación' :
                                 cita.servicio === 'desparasitacion' ? 'Desparasitación' :
                                 cita.servicio}
                              </div>
                              <div className="text-xs text-gray-600">
                                📅 {fechaCita.toLocaleDateString()} - {cita.horaCita}
                              </div>
                              <div className="mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  cita.estado === 'pendiente' ? 'bg-yellow-200 text-yellow-800' :
                                  cita.estado === 'aceptada' ? 'bg-green-200 text-green-800' :
                                  cita.estado === 'completada' ? 'bg-blue-200 text-blue-800' :
                                  'bg-red-200 text-red-800'
                                }`}>
                                  {cita.estado === 'pendiente' ? 'Pendiente' :
                                   cita.estado === 'aceptada' ? 'Aceptada' :
                                   cita.estado === 'completada' ? 'Completada' :
                                   cita.estado === 'cancelada' ? 'Cancelada' :
                                   cita.estado}
                                </span>
                              </div>
                            </div>
                            
                            {/* Botones de acción - Solo para propietarios */}
                            {isCompanyOwner() && (
                              <div className="flex flex-col gap-1">
                                {cita.estado === 'pendiente' && esProxima && (
                                  <button
                                    onClick={() => navigate(`/editar-cita/${cita.id}`)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded shadow transition"
                                  >
                                    Editar
                                  </button>
                                )}
                                {(cita.estado === 'pendiente' || cita.estado === 'aceptada') && esProxima && (
                                  <button
                                    onClick={() => handleCancelCita(cita.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded shadow transition"
                                  >
                                    Cancelar
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {cita.observaciones && (
                            <div className="text-xs text-gray-600 bg-white p-2 rounded border-l-2 border-green-300">
                              <strong>Observaciones:</strong> {cita.observaciones}
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="bottom-0 left-0 w-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 text-white text-center py-3 shadow-lg font-semibold tracking-wide mt-8">
          <p>&copy; 2025 FincaTec. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}

export default App
