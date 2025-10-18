// src/pages/VisualizarGruposPastoreo.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ALIMENTACION_POR_TIPO } from "./data.jsx";
import { useUser } from "./UserContext.jsx";

export default function VisualizarGruposPastoreo() {
  const { grupoId } = useParams(); // 👈 ahora recibimos el ID del grupo
  const navigate = useNavigate();
  const { getCompanyGroups, getCompanyLivestock, updateGroup, getUserCompany, updateAnimal, deleteGroup } = useUser();

  const [grupo, setGrupo] = useState(null);
  const [animales, setAnimales] = useState([]);
  const [animalesDisponibles, setAnimalesDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Cargar grupo y animales del grupo
  useEffect(() => {
    const company = getUserCompany();
    if (!company) {
      setCargando(false);
      return;
    }

    const grupos = getCompanyGroups() || [];
    const g = grupos.find((x) => x.id === grupoId) || null;
    setGrupo(g);

    const all = getCompanyLivestock() || [];
    const delGrupo = all.filter((a) => a.grupo === grupoId);
    setAnimales(delGrupo);

    // Animales disponibles: misma especie pero sin grupo o con grupo diferente
    const disponibles = all.filter((a) => {
      // Debe ser de la misma especie que el grupo
      const mismaEspecie = g ? a.especie === g.especie : true;
      // No debe estar en este grupo ya
      const noEnGrupo = a.grupo !== grupoId;
      // Puede estar sin grupo o en otro grupo (para permitir cambios)
      return mismaEspecie && noEnGrupo;
    });
    setAnimalesDisponibles(disponibles);

    setCargando(false);
  }, [grupoId, getCompanyGroups, getCompanyLivestock, getUserCompany]);

  const tipoKey = (grupo?.especie ?? "").charAt(0).toUpperCase() + (grupo?.especie ?? "").slice(1).toLowerCase();

  // Claves para historial por grupo (localStorage solo para histórico)
  const LS_KEYS = useMemo(
    () => ({
      historial: `historial:grupo:${grupoId}`,
    }),
    [grupoId]
  );

  const [historial, setHistorial] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.historial);
      if (raw) return JSON.parse(raw) ?? [];
    } catch {}
    return [];
  });

  // Alimentación actual viene del propio grupo; si no hay, usamos defaults por especie
  const baseAlim =
    grupo?.alimentacion ??
    (ALIMENTACION_POR_TIPO[tipoKey] ?? {
      tipo: "No definido",
      cantidad: "-",
      horario: "-",
      suplemento: "-",
      observaciones: "-",
    });

  const [alimentacionActual, setAlimentacionActual] = useState(baseAlim);

  // Si cambia el grupo, rehacer estado de alimentación
  useEffect(() => {
    setAlimentacionActual(baseAlim);
  }, [grupoId, grupo]); // eslint-disable-line

  // Persistir historial
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.historial, JSON.stringify(historial));
    } catch {}
  }, [historial, LS_KEYS]);

  // ===== Modal de formulario =====
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState/** @type {"add"|"edit"|"addAnimal"} */("add");
  const emptyForm = {
    tipo: "",
    cantidad: "",
    horario: "",
    suplemento: "",
    observaciones: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  
  // ===== Modal para añadir animal =====
  const [selectedAnimal, setSelectedAnimal] = useState("");

  const openAdd = () => {
    setMode("add");
    setForm(emptyForm);
    setErrors({});
    setIsOpen(true);
  };

  const openEdit = () => {
    setMode("edit");
    setForm(alimentacionActual);
    setErrors({});
    setIsOpen(true);
  };

  const openAddAnimal = () => {
    setMode("addAnimal");
    setSelectedAnimal("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setErrors({});
    setSelectedAnimal("");
  };

  const validate = (f) => {
    const e = {};
    if (!f.tipo.trim()) e.tipo = "Requerido";
    if (!f.cantidad.trim()) e.cantidad = "Requerido";
    if (!f.horario.trim()) e.horario = "Requerido";
    if (!f.suplemento.trim()) e.suplemento = "Requerido";
    return e;
  };

  const guardarAlimentacion = async (nueva) => {
    // Guardar estado anterior en historial
    setHistorial((h) => [
      { fecha: new Date().toISOString(), data: alimentacionActual },
      ...h,
    ]);

    setAlimentacionActual({ ...nueva });

    // Persistir en el grupo (para que quede guardado realmente)
    if (grupo) {
      updateGroup?.(grupo.id, { alimentacion: { ...nueva } });
      // refrescar grupo en memoria
      const grupos = getCompanyGroups() || [];
      const g = grupos.find((x) => x.id === grupoId) || null;
      setGrupo(g);
    }
  };

  const submitForm = (ev) => {
    ev.preventDefault();
    
    if (mode === "addAnimal") {
      if (!selectedAnimal) {
        alert("Por favor selecciona un animal");
        return;
      }
      
      // Simplificado: solo actualizar el animal al grupo actual
      // El UserContext se encarga de la consistencia automáticamente
      const result = updateAnimal(selectedAnimal, { grupo: grupoId });
      
      if (result?.success) {
        alert("Animal agregado al grupo exitosamente");
        closeModal();
        
        // Recargar datos
        window.location.reload();
      } else {
        alert("Error al agregar el animal al grupo: " + (result.error || "Error desconocido"));
      }
      return;
    }
    
    // Lógica original para alimentación
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    guardarAlimentacion(form);
    closeModal();
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar la alimentación actual del grupo?")) return;
    const reset = {
      tipo: "No definido",
      cantidad: "-",
      horario: "-",
      suplemento: "-",
      observaciones: "-",
    };
    guardarAlimentacion(reset);
  };

  const handleRemoveAnimal = (animalId) => {
    if (!confirm("¿Remover este animal del grupo?")) return;
    
    // Simplificado: solo actualizar el animal para quitarlo del grupo
    // El UserContext se encarga de la consistencia automáticamente
    const result = updateAnimal(animalId, { grupo: null });
    
    if (result?.success) {
      alert("Animal removido del grupo exitosamente");
      
      // Recargar datos
      window.location.reload();
    } else {
      alert("Error al remover el animal del grupo: " + (result.error || "Error desconocido"));
    }
  };

  const handleDeleteGroup = () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el grupo "${grupo.nombre || grupo.id}"?\n\nEsto también removerá todos los animales del grupo (${animales.length} animales).`)) {
      return;
    }

    const result = deleteGroup(grupoId);
    
    if (result?.success) {
      alert("Grupo eliminado exitosamente. Todos los animales han sido removidos del grupo.");
      // Redirigir al menú principal
      navigate('/App');
    } else {
      alert("Error al eliminar el grupo: " + (result.error || "Error desconocido"));
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-green-50 py-10">
        <div className="max-w-6xl mx-auto px-4 text-gray-600">Cargando…</div>
      </main>
    );
  }

  if (!grupo) {
    return (
      <main className="min-h-screen bg-green-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-green-700">
              Grupo no encontrado
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
            >
              Volver
            </button>
          </div>
          <p className="text-gray-700">Verifica el identificador del grupo.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-green-700">
              {grupo.nombre || `Grupo ${grupo.id}`}
            </h1>
            <p className="text-sm text-gray-500">
              ID: <span className="font-semibold">{grupo.id}</span> · Especie:{" "}
              <span className="font-semibold">{tipoKey || "-"}</span> · Animales:{" "}
              <span className="font-semibold">{animales.length}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDeleteGroup}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition"
              title="Eliminar grupo completo"
            >
              Eliminar Grupo
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              Volver
            </button>
          </div>
        </div>

        {/* Layout principal: Panel de alimentación (izquierda) + tarjetas (derecha) */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* 📦 Panel izquierdo: Alimentación del grupo */}
          <aside className="lg:col-span-1 bg-white rounded-2xl border-2 border-green-300 shadow-lg p-6">
            <h2 className="text-2xl font-extrabold text-green-700 mb-2">
              Alimentación actual
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Grupo: <span className="font-semibold">{grupo.nombre || grupo.id}</span>
            </p>

            <div className="space-y-2 text-gray-800">
              <p>
                <span className="font-semibold">Tipo:</span>{" "}
                <span className="italic">{alimentacionActual.tipo}</span>
              </p>
              <p>
                <span className="font-semibold">Cantidad:</span>{" "}
                {alimentacionActual.cantidad}
              </p>
              <p>
                <span className="font-semibold">Horario:</span>{" "}
                {alimentacionActual.horario}
              </p>
              <p>
                <span className="font-semibold">Suplemento:</span>{" "}
                {alimentacionActual.suplemento}
              </p>
              <p>
                <span className="font-semibold">Observaciones:</span>{" "}
                {alimentacionActual.observaciones}
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={openAdd}
                className="px-4 py-2 rounded-full border-2 border-green-600 text-green-700 hover:bg-green-50"
              >
                Añadir
              </button>
              <button
                onClick={openEdit}
                className="px-4 py-2 rounded-full border-2 border-amber-600 text-amber-700 hover:bg-amber-50"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-full border-2 border-red-600 text-red-700 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>

            {/* Historial */}
            <div className="mt-6">
              <h3 className="text-lg font-bold text-gray-700">
                Registros anteriores
              </h3>
              {historial.length === 0 ? (
                <p className="text-sm text-gray-500 mt-2">
                  No hay registros previos.
                </p>
              ) : (
                <ol className="list-decimal ml-5 mt-2 space-y-2 text-sm text-gray-700">
                  {historial.map((h, idx) => (
                    <li key={idx}>
                      <span className="text-gray-500 block">
                        {new Date(h.fecha).toLocaleString()}
                      </span>
                      <div className="leading-tight">
                        <span className="font-semibold">Tipo:</span>{" "}
                        <span className="italic">{h.data.tipo}</span> —{" "}
                        <span className="font-semibold">Cant.:</span>{" "}
                        {h.data.cantidad} —{" "}
                        <span className="font-semibold">Horario:</span>{" "}
                        {h.data.horario}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>

          {/* 🐄 Tarjetas derecha */}
          <section className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-700">
                Animales en el grupo ({animales.length})
              </h2>
              <button
                onClick={openAddAnimal}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Agregar Animal
              </button>
            </div>
            
            {animales.length === 0 ? (
              <div className="mt-10 text-center text-gray-600">
                No hay animales asignados a este grupo.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {animales.map((animal) => (
                  <article
                    key={animal.id}
                    className="bg-white rounded-2xl border-2 border-green-300 shadow-lg p-6 relative"
                  >
                    <button
                      onClick={() => handleRemoveAnimal(animal.identificacion || animal.id)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded shadow transition"
                      title="Remover del grupo"
                    >
                      ✕
                    </button>
                    
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={animal.foto}
                        alt={animal.nombre}
                        className="w-28 h-28 object-cover rounded-xl border-4 border-green-200 shadow mb-4"
                        onError={(e) => {
                          e.currentTarget.src = '/images/Ganado_Relleno/animal_default.png';
                        }}
                      />
                      <h2 className="text-2xl font-extrabold text-green-700 mb-2">
                        {animal.nombre}
                      </h2>
                    </div>

                    <ul className="space-y-1 text-gray-700">
                      <li>
                        <span className="font-semibold">Identificación:</span>{" "}
                        {animal.id}
                      </li>
                      <li>
                        <span className="font-semibold">Especie:</span>{" "}
                        {animal.especie}
                      </li>
                      <li>
                        <span className="font-semibold">Raza:</span>{" "}
                        {animal.raza}
                      </li>
                      <li>
                        <span className="font-semibold">Sexo:</span>{" "}
                        {animal.sexo}
                      </li>
                      {animal.fechaNacimiento && (
                        <li>
                          <span className="font-semibold">
                            Fecha de nacimiento:
                          </span>{" "}
                          {animal.fechaNacimiento}
                        </li>
                      )}
                      {animal.potreroActual && (
                        <li>
                          <span className="font-semibold">Potrero actual:</span>{" "}
                          {animal.potreroActual}
                        </li>
                      )}
                      <li>
                        <span className="font-semibold">Peso:</span>{" "}
                        {(animal.pesoKg ?? animal.peso) || "-"} kg
                      </li>
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ===== Modal ===== */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-700">
                {mode === "add" ? "Añadir alimentación" : 
                 mode === "edit" ? "Editar alimentación" : 
                 "Agregar Animal al Grupo"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            {mode === "addAnimal" ? (
              // Formulario para agregar animal
              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Seleccionar Animal ({grupo?.especie || "Cualquier especie"})
                  </label>
                  {animalesDisponibles.length === 0 ? (
                    <p className="text-gray-600 text-sm">
                      No hay animales disponibles de la especie {grupo?.especie || "correspondiente"} para agregar al grupo.
                    </p>
                  ) : (
                    <select
                      value={selectedAnimal}
                      onChange={(e) => setSelectedAnimal(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-200"
                      required
                    >
                      <option value="">-- Selecciona un animal --</option>
                      {animalesDisponibles.map((animal) => (
                        <option key={animal.identificacion || animal.id} value={animal.identificacion || animal.id}>
                          {animal.nombre} (ID: {animal.identificacion || animal.id}) - {animal.raza} - {animal.sexo}
                          {animal.grupo ? ` - Grupo actual: ${animal.grupo}` : " - Sin grupo"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedAnimal && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Vista previa del animal:</h4>
                    {(() => {
                      const animal = animalesDisponibles.find(a => (a.identificacion || a.id) === selectedAnimal);
                      return animal ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={animal.foto}
                            alt={animal.nombre}
                            className="w-16 h-16 object-cover rounded-lg border border-green-300"
                            onError={(e) => { e.currentTarget.src = '/images/Ganado_Relleno/animal_default.png'; }}
                          />
                          <div className="text-sm text-gray-700">
                            <div><strong>Nombre:</strong> {animal.nombre}</div>
                            <div><strong>Especie:</strong> {animal.especie}</div>
                            <div><strong>Raza:</strong> {animal.raza}</div>
                            <div><strong>Peso:</strong> {animal.peso} kg</div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedAnimal || animalesDisponibles.length === 0}
                    className={`px-4 py-2 rounded-lg shadow transition ${
                      selectedAnimal && animalesDisponibles.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Agregar Animal
                  </button>
                </div>
              </form>
            ) : (
              // Formulario original para alimentación
              <form onSubmit={submitForm} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Tipo
                  </label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 outline-none ${
                      errors.tipo
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-green-200"
                    }`}
                    value={form.tipo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tipo: e.target.value }))
                    }
                    placeholder="Pastoreo + suplemento mineral"
                  />
                  {errors.tipo && (
                    <p className="text-xs text-red-600 mt-1">{errors.tipo}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Cantidad
                    </label>
                    <input
                      className={`w-full border rounded-lg px-3 py-2 outline-none ${
                        errors.cantidad
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:ring-2 focus:ring-green-200"
                      }`}
                      value={form.cantidad}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, cantidad: e.target.value }))
                      }
                      placeholder="8–12 kg MS/día"
                    />
                    {errors.cantidad && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.cantidad}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Horario
                    </label>
                    <input
                      className={`w-full border rounded-lg px-3 py-2 outline-none ${
                        errors.horario
                          ? "border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 focus:ring-2 focus:ring-green-200"
                      }`}
                      value={form.horario}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, horario: e.target.value }))
                      }
                      placeholder="Mañana y tarde"
                    />
                    {errors.horario && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.horario}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Suplemento
                  </label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2 outline-none ${
                      errors.suplemento
                        ? "border-red-500 focus:ring-2 focus:ring-red-200"
                        : "border-gray-300 focus:ring-2 focus:ring-green-200"
                    }`}
                    value={form.suplemento}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, suplemento: e.target.value }))
                    }
                    placeholder="Mezcla mineral ad libitum"
                  />
                  {errors.suplemento && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.suplemento}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-200 min-h-20"
                    value={form.observaciones}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, observaciones: e.target.value }))
                    }
                    placeholder="Ajustar ración en lactancia / engorde"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
