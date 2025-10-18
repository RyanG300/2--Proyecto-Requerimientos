// src/VisualizarGanado.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import UserContext from "./UserContext";

function VisualizarGanado() {
  const { id } = useParams(); // ID del animal (arete)
  const navigate = useNavigate();
  const { user, getCompanyLivestock, deleteAnimal } = useContext(UserContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Obtener todos los animales de la empresa del usuario
  const animals = getCompanyLivestock();
  
  // Buscar el animal específico por su ID (arete)
  const animal = animals.find(a => a.identificacion === id || a.id === id);

  // Función para manejar la eliminación del animal
  const handleDelete = () => {
    const result = deleteAnimal(animal.id);
    if (result.success) {
      alert('Animal eliminado exitosamente');
      navigate('/App');
    } else {
      alert('Error al eliminar el animal: ' + result.error);
    }
    setShowDeleteConfirm(false);
  };

  // Función para editar el animal
  const handleEdit = () => {
    // Por ahora redirigir a agregar ganado con los datos prellenados
    // En el futuro se podría crear una página específica de edición
    navigate(`/add-ganado?edit=${animal.id}`);
  };

  if (!animal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center text-gray-700">
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          No se encontró el animal con ID: {id}
        </h2>
        <button
          onClick={() => navigate("/App")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Volver al menú principal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Título y botones de acción */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700 mb-4">
            Detalles del Animal
          </h1>
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Datos del animal - Lado izquierdo */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-green-300">
            <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
              📋 Información del Animal
            </h2>
            
            <div className="flex flex-col items-center mb-6">
              <img
                src={animal.foto || "/images/Ganado_Relleno/default-animal.png"}
                alt={animal.nombre}
                className="w-32 h-32 object-cover rounded-xl border-4 border-green-400 mb-4"
              />
              <h3 className="text-2xl font-extrabold text-green-700">
                {animal.nombre}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-bold text-green-800">Arete/ID:</span>
                <span className="text-gray-700 font-medium">{animal.id}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-green-800">Especie:</span>
                <span className="text-gray-700 font-medium">{animal.especie}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-bold text-green-800">Raza:</span>
                <span className="text-gray-700 font-medium">{animal.raza}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-green-800">Sexo:</span>
                <span className="text-gray-700 font-medium">{animal.sexo}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-bold text-green-800">Fecha de Nacimiento:</span>
                <span className="text-gray-700 font-medium">{animal.fechaNacimiento}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-green-800">Peso:</span>
                <span className="text-gray-700 font-medium">{animal.peso} kg</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-bold text-green-800">Grupo:</span>
                <span className="text-gray-700 font-medium">
                  {animal.grupo || "Sin grupo asignado"}
                </span>
              </div>
            </div>
          </div>

          {/* Información del grupo - Lado derecho */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-orange-300">
            <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">
              🐄 Información del Grupo
            </h2>
            
            {animal.grupo ? (
              <div className="text-center">
                <div className="mb-6">
                  <img
                    src="/images/Menu_finqueros/grupo-pastoreo.png"
                    alt="Grupo de pastoreo"
                    className="w-32 h-32 object-cover rounded-xl border-4 border-orange-400 mx-auto mb-4"
                  />
                  <h3 className="text-2xl font-extrabold text-orange-700">
                    {animal.grupo}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-bold text-orange-800">Tipo de Grupo:</span>
                    <span className="text-gray-700 font-medium">Pastoreo</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-orange-800">Animales en el Grupo:</span>
                    <span className="text-gray-700 font-medium">
                      {animals.filter(a => a.grupo === animal.grupo).length}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-bold text-orange-800">Estado:</span>
                    <span className="px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold text-sm">
                      Activo
                    </span>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-orange-800 block mb-2">Ubicación Actual:</span>
                    <span className="text-gray-700 text-sm">
                      Potrero asignado para pastoreo rotativo
                    </span>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <span className="font-bold text-orange-800 block mb-2">Notas:</span>
                    <span className="text-gray-700 text-sm">
                      Grupo de pastoreo en rotación. Se mueve cada 15 días aproximadamente.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-4">
                  Sin Grupo Asignado
                </h3>
                <p className="text-gray-400">
                  Este animal no pertenece actualmente a ningún grupo de pastoreo.
                </p>
                <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow font-medium">
                  Asignar a Grupo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Información Médica */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-blue-300 mt-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            📋 Información Médica
          </h2>
          
          {animal.informacionMedica ? (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Historial de Vacunas */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Historial de Vacunas
                  </h3>
                  {animal.informacionMedica.historialVacunas?.length > 0 ? (
                    <div className="space-y-2">
                      {animal.informacionMedica.historialVacunas.map((vacuna, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-400">
                          <div className="font-medium text-blue-800">{vacuna.nombre}</div>
                          <div className="text-sm text-gray-600">Fecha: {vacuna.fecha}</div>
                          {vacuna.veterinario && (
                            <div className="text-sm text-gray-600">Veterinario: {vacuna.veterinario}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay vacunas registradas</p>
                  )}
                </div>

                {/* Historial de Enfermedades */}
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historial de Enfermedades
                  </h3>
                  {animal.informacionMedica.historialEnfermedades?.length > 0 ? (
                    <div className="space-y-2">
                      {animal.informacionMedica.historialEnfermedades.map((enfermedad, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-red-400">
                          <div className="font-medium text-red-800">{enfermedad.nombre}</div>
                          <div className="text-sm text-gray-600">Fecha: {enfermedad.fecha}</div>
                          {enfermedad.tratamiento && (
                            <div className="text-sm text-gray-600">Tratamiento: {enfermedad.tratamiento}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay enfermedades registradas</p>
                  )}
                </div>

                {/* Próximas Vacunas */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Próximas Vacunas
                  </h3>
                  {animal.informacionMedica.proximasVacunas?.length > 0 ? (
                    <div className="space-y-2">
                      {animal.informacionMedica.proximasVacunas.map((vacuna, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                          <div className="font-medium text-yellow-800">{vacuna.nombre}</div>
                          <div className="text-sm text-gray-600">Fecha programada: {vacuna.fecha}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay vacunas programadas</p>
                  )}
                </div>

                {/* Tratamientos Activos */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Tratamientos Activos
                  </h3>
                  {animal.informacionMedica.tratamientosActivos?.length > 0 ? (
                    <div className="space-y-2">
                      {animal.informacionMedica.tratamientosActivos.map((tratamiento, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                          <div className="font-medium text-green-800">{tratamiento.nombre}</div>
                          <div className="text-sm text-gray-600">Inicio: {tratamiento.fechaInicio}</div>
                          {tratamiento.fechaFin && (
                            <div className="text-sm text-gray-600">Fin: {tratamiento.fechaFin}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No hay tratamientos activos</p>
                  )}
                </div>
              </div>

              {/* Observaciones del Veterinario */}
              {animal.informacionMedica.observacionesVeterinario && (
                <div className="bg-purple-50 rounded-lg p-4 mt-6">
                  <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Observaciones del Veterinario
                  </h3>
                  <div className="bg-white p-4 rounded border-l-4 border-purple-400">
                    <p className="text-gray-700">{animal.informacionMedica.observacionesVeterinario}</p>
                    {animal.informacionMedica.fechaUltimaRevision && (
                      <div className="text-sm text-gray-500 mt-2">
                        Última revisión: {new Date(animal.informacionMedica.fechaUltimaRevision).toLocaleDateString()}
                      </div>
                    )}
                    {animal.informacionMedica.veterinarioAsignado && (
                      <div className="text-sm text-gray-500">
                        Veterinario: {animal.informacionMedica.veterinarioAsignado}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">
                {animal.informacionMedica.fechaUltimaRevision && (
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="font-medium">Última revisión:</span> {new Date(animal.informacionMedica.fechaUltimaRevision).toLocaleDateString()}
                  </div>
                )}
                {animal.informacionMedica.veterinarioAsignado && (
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="font-medium">Veterinario asignado:</span> {animal.informacionMedica.veterinarioAsignado}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Sin Información Médica
              </h3>
              <p className="text-gray-400">
                No hay información médica registrada para este animal. Los veterinarios podrán añadir información médica durante las consultas.
              </p>
            </div>
          )}
        </div>

        {/* Botón de regreso */}
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Eliminar Animal?
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar a <strong>{animal.nombre}</strong> (ID: {animal.id})? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualizarGanado;
