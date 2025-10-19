// src/components/VetGroupMedicalEditor.jsx
import { useState } from "react";
import { useUser } from "../UserContext";

export default function VetGroupMedicalEditor({ animales, open, onClose, onSaved }) {
  const { updateMedicalInfoGlobal } = useUser();
  const [loading, setLoading] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [showSelector, setShowSelector] = useState(true);
  const [selectedAnimals, setSelectedAnimals] = useState([]);

  // Form sections
  const [vacuna, setVacuna] = useState({ nombre: "", fecha: "", dosis: "", notas: "" });
  const [enfermedad, setEnfermedad] = useState({ nombre: "", inicio: "", fin: "", notas: "" });
  const [proxVacuna, setProxVacuna] = useState({ nombre: "", fecha: "", notas: "" });
  const [tratamiento, setTratamiento] = useState({ nombre: "", farmaco: "", dosis: "", desde: "", hasta: "", notas: "" });

  // Componentes auxiliares para mantener consistencia
  const section = (title, children, color = "border-blue-300") => (
    <div className={`p-4 rounded-xl border-2 ${color} bg-white`}>
      <h4 className="font-semibold mb-3">{title}</h4>
      {children}
    </div>
  );

  const input = (props) => (
    <input {...props} className="w-full p-2 border rounded-lg focus:outline-none focus:ring" />
  );
  
  const textarea = (props) => (
    <textarea {...props} className="w-full p-2 border rounded-lg focus:outline-none focus:ring" rows={3} />
  );

  if (!open) return null;

  const seleccionarAnimal = (animal) => {
    setAnimalSeleccionado(animal);
    setShowSelector(false);
  };

  const volverAlSelector = () => {
    setAnimalSeleccionado(null);
    setShowSelector(true);
    // Limpiar formularios
    setVacuna({ nombre: "", fecha: "", dosis: "", notas: "" });
    setEnfermedad({ nombre: "", inicio: "", fin: "", notas: "" });
    setProxVacuna({ nombre: "", fecha: "", notas: "" });
    setTratamiento({ nombre: "", farmaco: "", dosis: "", desde: "", hasta: "", notas: "" });
  };

  const baseMed = () => ({
    historialVacunas: animalSeleccionado?.informacionMedica?.historialVacunas || [],
    historialEnfermedades: animalSeleccionado?.informacionMedica?.historialEnfermedades || [],
    proximasVacunas: animalSeleccionado?.informacionMedica?.proximasVacunas || [],
    tratamientosActivos: animalSeleccionado?.informacionMedica?.tratamientosActivos || [],
  });

  const agregarVacuna = async () => {
    if (!vacuna.nombre || !vacuna.fecha) {
      alert("Por favor completa nombre y fecha de la vacuna");
      return;
    }
    setLoading(true);
    const nuevaInfo = {
      ...baseMed(),
      historialVacunas: [...baseMed().historialVacunas, { ...vacuna, id: Date.now() }],
    };
    const result = await updateMedicalInfoGlobal(animalSeleccionado.identificacion || animalSeleccionado.id, nuevaInfo);
    setLoading(false);
    if (result.success) {
      setVacuna({ nombre: "", fecha: "", dosis: "", notas: "" });
      alert("Vacuna agregada exitosamente");
    } else {
      alert(result.error || "Error al agregar vacuna");
    }
  };

  const agregarEnfermedad = async () => {
    if (!enfermedad.nombre || !enfermedad.inicio) {
      alert("Por favor completa nombre y fecha de inicio");
      return;
    }
    setLoading(true);
    const nuevaInfo = {
      ...baseMed(),
      historialEnfermedades: [...baseMed().historialEnfermedades, { ...enfermedad, id: Date.now() }],
    };
    const result = await updateMedicalInfoGlobal(animalSeleccionado.identificacion || animalSeleccionado.id, nuevaInfo);
    setLoading(false);
    if (result.success) {
      setEnfermedad({ nombre: "", inicio: "", fin: "", notas: "" });
      alert("Enfermedad agregada exitosamente");
    } else {
      alert(result.error || "Error al agregar enfermedad");
    }
  };

  const agregarProximaVacuna = async () => {
    if (!proxVacuna.nombre || !proxVacuna.fecha) {
      alert("Por favor completa nombre y fecha de la próxima vacuna");
      return;
    }
    setLoading(true);
    const nuevaInfo = {
      ...baseMed(),
      proximasVacunas: [...baseMed().proximasVacunas, { ...proxVacuna, id: Date.now() }],
    };
    const result = await updateMedicalInfoGlobal(animalSeleccionado.identificacion || animalSeleccionado.id, nuevaInfo);
    setLoading(false);
    if (result.success) {
      setProxVacuna({ nombre: "", fecha: "", notas: "" });
      alert("Próxima vacuna programada exitosamente");
    } else {
      alert(result.error || "Error al programar vacuna");
    }
  };

  const agregarTratamiento = async () => {
    if (!tratamiento.nombre || !tratamiento.farmaco) {
      alert("Por favor completa nombre del tratamiento y fármaco");
      return;
    }
    setLoading(true);
    const nuevaInfo = {
      ...baseMed(),
      tratamientosActivos: [...baseMed().tratamientosActivos, { ...tratamiento, id: Date.now() }],
    };
    const result = await updateMedicalInfoGlobal(animalSeleccionado.identificacion || animalSeleccionado.id, nuevaInfo);
    setLoading(false);
    if (result.success) {
      setTratamiento({ nombre: "", farmaco: "", dosis: "", desde: "", hasta: "", notas: "" });
      alert("Tratamiento agregado exitosamente");
    } else {
      alert(result.error || "Error al agregar tratamiento");
    }
  };

  const finalizarEdicion = () => {
    onSaved?.();
  };

  const guardarCambios = () => {
    // Esta función maneja el botón "Guardar cambios" del modal grupal
    // Como cada acción médica se guarda individualmente, solo cerramos el modal
    resetearModal();
    onClose();
    onSaved?.();
  };

  const resetearModal = () => {
    setAnimalSeleccionado(null);
    setShowSelector(true);
    setVacuna({ nombre: "", fecha: "", dosis: "", notas: "" });
    setEnfermedad({ nombre: "", inicio: "", fin: "", notas: "" });
    setProxVacuna({ nombre: "", fecha: "", notas: "" });
    setTratamiento({ nombre: "", farmaco: "", dosis: "", desde: "", hasta: "", notas: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col">
        {/* Header sticky */}
        <div className="px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-blue-700">
            {showSelector 
              ? `Edición Grupal — ${animales.length} animales` 
              : `Información médica — ${animalSeleccionado?.nombre || animalSeleccionado?.identificacion}`
            }
          </h3>
          <button
            onClick={() => {
              resetearModal();
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="px-6 py-4 overflow-y-auto">
          {showSelector ? (
            // Selector de animales
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Selecciona un animal para editar su información médica:
                </h4>
                {animales.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-xl border-2 border-gray-300 bg-gray-50">
                      <p className="text-gray-500 mb-4">No se encontraron animales en este grupo</p>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {animales.map((animal) => (
                      <div
                        key={animal.id || animal.identificacion}
                        className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all duration-200 hover:border-blue-400"
                        onClick={() => seleccionarAnimal(animal)}
                      >
                        <div className="flex items-center space-x-3">
                          {animal.foto && (
                            <img
                              src={animal.foto}
                              alt={animal.nombre}
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-blue-800">
                              {animal.nombre || "Sin nombre"}
                            </h4>
                            <p className="text-sm text-blue-600">
                              ID: {animal.identificacion || animal.id}
                            </p>
                            <p className="text-sm text-blue-600">
                              {animal.especie} - {animal.raza}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Editor de información médica individual
            <div>
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={volverAlSelector}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  ← Volver al selector
                </button>
                <button
                  onClick={finalizarEdicion}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Finalizar edición
                </button>
              </div>

              {/* Información del animal seleccionado */}
              <div className="mb-6 p-4 rounded-xl border-2 border-blue-300 bg-blue-50">
                <div className="flex items-center space-x-4">
                  {animalSeleccionado?.foto && (
                    <img
                      src={animalSeleccionado.foto}
                      alt={animalSeleccionado.nombre}
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800">
                      {animalSeleccionado?.nombre || "Sin nombre"}
                    </h3>
                    <p className="text-blue-600">
                      ID: {animalSeleccionado?.identificacion || animalSeleccionado?.id}
                    </p>
                    <p className="text-blue-600">
                      {animalSeleccionado?.especie} - {animalSeleccionado?.raza}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formularios de edición médica en grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Historial de Vacunas */}
                {section("Historial de Vacunas", (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {input({ placeholder: "Nombre de vacuna", value: vacuna.nombre, onChange: (e) => setVacuna({ ...vacuna, nombre: e.target.value }) })}
                      {input({ type: "date", value: vacuna.fecha, onChange: (e) => setVacuna({ ...vacuna, fecha: e.target.value }) })}
                      {input({ placeholder: "Dosis", value: vacuna.dosis, onChange: (e) => setVacuna({ ...vacuna, dosis: e.target.value }) })}
                    </div>
                    <div className="mt-2">{textarea({ placeholder: "Notas", value: vacuna.notas, onChange: (e) => setVacuna({ ...vacuna, notas: e.target.value }) })}</div>
                    <button
                      onClick={agregarVacuna}
                      disabled={loading || !vacuna.nombre || !vacuna.fecha}
                      className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : "Agregar vacuna"}
                    </button>
                  </>
                ), "border-blue-300")}

                {/* Historial de Enfermedades */}
                {section("Historial de Enfermedades", (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {input({ placeholder: "Nombre", value: enfermedad.nombre, onChange: (e) => setEnfermedad({ ...enfermedad, nombre: e.target.value }) })}
                      {input({ type: "date", value: enfermedad.inicio, onChange: (e) => setEnfermedad({ ...enfermedad, inicio: e.target.value }) })}
                      {input({ type: "date", placeholder: "Fecha fin (opcional)", value: enfermedad.fin, onChange: (e) => setEnfermedad({ ...enfermedad, fin: e.target.value }) })}
                    </div>
                    <div className="mt-2">{textarea({ placeholder: "Notas", value: enfermedad.notas, onChange: (e) => setEnfermedad({ ...enfermedad, notas: e.target.value }) })}</div>
                    <button
                      onClick={agregarEnfermedad}
                      disabled={loading || !enfermedad.nombre || !enfermedad.inicio}
                      className="mt-3 px-4 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : "Agregar enfermedad"}
                    </button>
                  </>
                ), "border-rose-300")}

                {/* Próximas Vacunas */}
                {section("Próximas Vacunas", (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {input({ placeholder: "Vacuna", value: proxVacuna.nombre, onChange: (e) => setProxVacuna({ ...proxVacuna, nombre: e.target.value }) })}
                      {input({ type: "date", value: proxVacuna.fecha, onChange: (e) => setProxVacuna({ ...proxVacuna, fecha: e.target.value }) })}
                    </div>
                    <div className="mt-2">{textarea({ placeholder: "Notas", value: proxVacuna.notas, onChange: (e) => setProxVacuna({ ...proxVacuna, notas: e.target.value }) })}</div>
                    <button
                      onClick={agregarProximaVacuna}
                      disabled={loading || !proxVacuna.nombre || !proxVacuna.fecha}
                      className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-white disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : "Agendar próxima vacuna"}
                    </button>
                  </>
                ), "border-amber-300")}

                {/* Tratamientos Activos */}
                {section("Tratamientos Activos", (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      {input({ placeholder: "Nombre", value: tratamiento.nombre, onChange: (e) => setTratamiento({ ...tratamiento, nombre: e.target.value }) })}
                      {input({ placeholder: "Fármaco", value: tratamiento.farmaco, onChange: (e) => setTratamiento({ ...tratamiento, farmaco: e.target.value }) })}
                      {input({ placeholder: "Dosis", value: tratamiento.dosis, onChange: (e) => setTratamiento({ ...tratamiento, dosis: e.target.value }) })}
                      {input({ type: "date", value: tratamiento.desde, onChange: (e) => setTratamiento({ ...tratamiento, desde: e.target.value }) })}
                      {input({ type: "date", value: tratamiento.hasta, onChange: (e) => setTratamiento({ ...tratamiento, hasta: e.target.value }) })}
                    </div>
                    <div className="mt-2">{textarea({ placeholder: "Notas", value: tratamiento.notas, onChange: (e) => setTratamiento({ ...tratamiento, notas: e.target.value }) })}</div>
                    <button
                      onClick={agregarTratamiento}
                      disabled={loading || !tratamiento.nombre || !tratamiento.desde}
                      className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : "Agregar tratamiento"}
                    </button>
                  </>
                ), "border-emerald-300")}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t bg-gray-50 px-6 py-4 rounded-b-2xl">
                <button
                  onClick={() => {
                    resetearModal();
                    onClose();
                  }}
                  className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarCambios}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
