// src/VisualizarGanado.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import UserContext from "./UserContext";

function VisualizarGanado() {
  const { id } = useParams(); // ID del animal (arete)
  const navigate = useNavigate();
  const { user, getCompanyLivestock, deleteAnimal, getCompanyGroups, updateAnimal } = useContext(UserContext);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [localAnimal, setLocalAnimal] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  // Obtener todos los animales de la empresa del usuario
  const animals = getCompanyLivestock();

  // Buscar el animal específico por su ID (arete)
  const animal = localAnimal || animals.find((a) => a.identificacion === id || a.id === id);

  // Inicializar el animal local cuando se carga por primera vez
  if (!localAnimal && animal) {
    setLocalAnimal(animal);
  }

  // Obtener información del grupo si el animal pertenece a uno
  const grupos = getCompanyGroups();
  const grupoInfo = animal?.grupo ? grupos.find(g => g.id === animal.grupo || g.codigo === animal.grupo) : null;

  // ===== helpers médicos =====
  const med = animal?.informacionMedica || {};
  const vacunas = Array.isArray(med.historialVacunas) ? med.historialVacunas : [];
  const enfers = Array.isArray(med.historialEnfermedades) ? med.historialEnfermedades : [];
  const proxVac = Array.isArray(med.proximasVacunas) ? med.proximasVacunas : [];
  const trats  = Array.isArray(med.tratamientosActivos) ? med.tratamientosActivos : [];

  // Función para manejar la eliminación del animal
  const handleDelete = () => {
    const result = deleteAnimal(animal.id);
    if (result.success) {
      alert("Animal eliminado exitosamente");
      navigate("/App");
    } else {
      alert("Error al eliminar el animal: " + result.error);
    }
    setShowDeleteConfirm(false);
  };

  // Función para editar el animal
  const handleEdit = () => {
    navigate(`/add-ganado?edit=${animal.id}`);
  };

  // Funciones para edición inline
  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingField || !animal) return;

    setSaving(true);
    const updateData = { [editingField]: editValue };
    const result = updateAnimal(animal.id, updateData);

    if (result.success) {
      // Actualizar el animal local
      setLocalAnimal(prev => ({
        ...prev,
        [editingField]: editValue
      }));
      setEditingField(null);
      setEditValue("");
    } else {
      alert("Error al actualizar: " + result.error);
    }
    setSaving(false);
  };

  // Función para cambiar la foto
  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = updateAnimal(animal.id, { foto: e.target.result });
        if (result.success) {
          setLocalAnimal(prev => ({
            ...prev,
            foto: e.target.result
          }));
        } else {
          alert("Error al actualizar la foto: " + result.error);
        }
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para renderizar campo editable
  const renderEditableField = (field, label, currentValue, type = "text") => {
    const isEditing = editingField === field;
    
    return (
      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
        <span className="font-bold text-green-800">{label}:</span>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
            />
            <button
              onClick={saveEdit}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
              disabled={saving}
            >
              {saving ? "..." : "✓"}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
            >
              ✗
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">{currentValue}</span>
            <button
              onClick={() => startEdit(field, currentValue)}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
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
            {/* Botón de regreso */}
            <button
              onClick={() => navigate(-1)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
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
              <span className="block text-sm font-normal text-gray-600 mt-1">
                Haz clic en el ícono ✏️ para editar cada campo
              </span>
            </h2>

            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={animal.foto || "/images/Ganado_Relleno/default-animal.png"}
                  alt={animal.nombre}
                  className="w-32 h-32 object-cover rounded-xl border-4 border-green-400 mb-4"
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <div className="text-white text-sm">Subiendo...</div>
                  </div>
                )}
                <label className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <h3 className="text-2xl font-extrabold text-green-700">
                {animal.nombre}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Haz clic en 📷 para cambiar la foto
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-bold text-green-800">Arete/ID:</span>
                <span className="text-gray-700 font-medium">{animal.id}</span>
              </div>

              {renderEditableField("nombre", "Nombre", animal.nombre)}
              {renderEditableField("especie", "Especie", animal.especie)}
              {renderEditableField("raza", "Raza", animal.raza)}
              {renderEditableField("sexo", "Sexo", animal.sexo)}
              {renderEditableField("fechaNacimiento", "Fecha de Nacimiento", animal.fechaNacimiento, "date")}
              {renderEditableField("peso", "Peso (kg)", animal.peso, "number")}

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

            {animal.grupo && grupoInfo ? (
              <div className="text-center">
                <div className="mb-6">
                  <img
                    src={grupoInfo.foto || "/images/Menu_finqueros/grupo-pastoreo.png"}
                    alt={`Grupo ${grupoInfo.nombre || animal.grupo}`}
                    className="w-32 h-32 object-cover rounded-xl border-4 border-orange-400 mx-auto mb-4"
                    onError={(e) => {
                      e.target.src = "/images/Menu_finqueros/grupo-pastoreo.png";
                    }}
                  />
                  <h3 className="text-2xl font-extrabold text-orange-700">
                    {grupoInfo.nombre || animal.grupo}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Código: {grupoInfo.codigo || grupoInfo.id}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-bold text-orange-800">Especie del Grupo:</span>
                    <span className="text-gray-700 font-medium">{grupoInfo.especie || 'No especificada'}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-orange-800">Animales en el Grupo:</span>
                    <span className="text-gray-700 font-medium">
                      {grupoInfo.miembros ? grupoInfo.miembros.length : animals.filter((a) => a.grupo === animal.grupo).length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-bold text-orange-800">Objetivo:</span>
                    <span className="text-gray-700 font-medium">{grupoInfo.objetivo || 'Pastoreo'}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-orange-800">Estado:</span>
                    <span className="px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold text-sm">
                      Activo
                    </span>
                  </div>

                  {grupoInfo.potrero && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <span className="font-bold text-orange-800 block mb-2">Potrero Asignado:</span>
                      <span className="text-gray-700 text-sm">{grupoInfo.potrero}</span>
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-bold text-orange-800 block mb-2">Creado:</span>
                    <span className="text-gray-700 text-sm">
                      {grupoInfo.createdAt ? new Date(grupoInfo.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                      {grupoInfo.createdBy && (
                        <span className="block text-xs text-gray-500 mt-1">
                          por: {grupoInfo.createdBy}
                        </span>
                      )}
                    </span>
                  </div>

                  {grupoInfo.alimentacion && Object.keys(grupoInfo.alimentacion).length > 0 && (
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <span className="font-bold text-orange-800 block mb-2">Alimentación:</span>
                      <div className="text-gray-700 text-sm space-y-1">
                        {Object.entries(grupoInfo.alimentacion).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : animal.grupo && !grupoInfo ? (
              <div className="text-center text-gray-500">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-4">Grupo No Encontrado</h3>
                <p className="text-gray-400 mb-2">
                  Este animal está asignado al grupo <strong>{animal.grupo}</strong>
                </p>
                <p className="text-gray-400 text-sm">
                  Pero no se encontró información detallada del grupo.
                </p>
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                  <span className="font-medium">Animales con este grupo:</span>{" "}
                  {animals.filter((a) => a.grupo === animal.grupo).length}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-4">Sin Grupo Asignado</h3>
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

        {/* ===== Sección de Información Médica (lee lo guardado por el veterinario) ===== */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-blue-300 mt-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center flex items-center justify-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            📋 Información Médica
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Historial de Vacunas */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Historial de Vacunas
              </h3>
              {vacunas.length > 0 ? (
                <div className="space-y-2">
                  {vacunas.map((v, i) => (
                    <div key={i} className="bg-white p-3 rounded border-l-4 border-blue-400">
                      <div className="font-medium text-blue-800">{v.nombre}</div>
                      <div className="text-sm text-gray-600">Fecha: {v.fecha}</div>
                      {v.dosis && <div className="text-sm text-gray-600">Dosis: {v.dosis}</div>}
                      {v.notas && <div className="text-sm text-gray-600">Notas: {v.notas}</div>}
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
              {enfers.length > 0 ? (
                <div className="space-y-2">
                  {enfers.map((e, i) => (
                    <div key={i} className="bg-white p-3 rounded border-l-4 border-red-400">
                      <div className="font-medium text-red-800">{e.nombre}</div>
                      <div className="text-sm text-gray-600">
                        Inicio: {e.inicio}{e.fin ? ` · Fin: ${e.fin}` : ""}
                      </div>
                      {e.notas && <div className="text-sm text-gray-600">Notas: {e.notas}</div>}
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
              {proxVac.length > 0 ? (
                <div className="space-y-2">
                  {proxVac.map((v, i) => (
                    <div key={i} className="bg-white p-3 rounded border-l-4 border-yellow-400">
                      <div className="font-medium text-yellow-800">{v.nombre}</div>
                      <div className="text-sm text-gray-600">Fecha programada: {v.fecha}</div>
                      {v.notas && <div className="text-sm text-gray-600">Notas: {v.notas}</div>}
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
              {trats.length > 0 ? (
                <div className="space-y-2">
                  {trats.map((t, i) => (
                    <div key={i} className="bg-white p-3 rounded border-l-4 border-green-400">
                      <div className="font-medium text-green-800">{t.nombre}</div>
                      <div className="text-sm text-gray-600">
                        {t.farmaco ? `Fármaco: ${t.farmaco} · ` : ""}
                        {t.dosis ? `Dosis: ${t.dosis} · ` : ""}
                        {t.desde ? `Desde: ${t.desde}` : ""}
                        {t.hasta ? ` · Hasta: ${t.hasta}` : ""}
                      </div>
                      {t.notas && <div className="text-sm text-gray-600">Notas: {t.notas}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No hay tratamientos activos</p>
              )}
            </div>
          </div>

          {/* Pie con última actualización (si existe) */}
          {(med.fechaUltimaActualizacion || med.actualizadoPor) && (
            <div className="mt-4 px-4 py-3 border rounded-lg text-sm text-gray-600 bg-gray-50">
              Última actualización:{" "}
              {med.fechaUltimaActualizacion
                ? new Date(med.fechaUltimaActualizacion).toLocaleString()
                : "—"}
              {med.actualizadoPor ? ` · por ${med.actualizadoPor}` : ""}
            </div>
          )}
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar Animal?</h3>
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
