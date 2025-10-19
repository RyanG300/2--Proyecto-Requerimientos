// src/pages/AddGrupo.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import { ALIMENTACION_POR_TIPO } from "./data.jsx";

function AddGrupo() {
  // NOTA: asegúrate de exponer estos métodos en tu UserContext.
  // - addGroup(grupoData)
  // - checkGroupExists(codigoGrupo:string)
  // - listAnimals({ especie?, onlyUngrouped? })  -> opcional
  // - getUserCompany()
  const {
    addGroup,
    checkGroupExists,
    listAnimals,         // opcional: si no existe, el selector de miembros se oculta
    getUserCompany,
    user,
  } = useUser();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userCompany, setUserCompany] = useState(null);
  const [codigoError, setCodigoError] = useState("");

  // Formulario grupo
  const [formData, setFormData] = useState({
    codigo: "",             // ej: G-004
    nombre: "",
    especie: "",            // Bovino | Ovino | Caprino
    objetivo: "",           // Carne | Leche | Trabajo | Hobby | Otros
    potrero: "",
    foto: null,             // dataURL
    // Alimentación inicial del grupo
    alimentacion: {
      tipo: "",
      cantidad: "",
      horario: "",
      suplemento: "",
      observaciones: "",
      costo: "",
    },
    miembros: [],           // ids de animales seleccionados
  });

  // Miembros disponibles (animales sin grupo de la especie)
  const [candidatos, setCandidatos] = useState([]);

  // Cargar empresa
  useEffect(() => {
    const company = getUserCompany();
    setUserCompany(company);
  }, [user, getUserCompany]);

  // Autorrellenar alimentación cuando cambia especie
  useEffect(() => {
    if (!formData.especie) return;
    const base = ALIMENTACION_POR_TIPO[formData.especie];
    if (base) {
      setFormData((prev) => ({
        ...prev,
        alimentacion: { ...base },
      }));
    }
  }, [formData.especie]);

  // Cargar candidatos a miembros si hay listAnimals
  useEffect(() => {
    const cargar = async () => {
      if (!listAnimals || !formData.especie) {
        setCandidatos([]);
        return;
      }
      try {
        const res = await listAnimals({
          especie: formData.especie,
          onlyUngrouped: true,
        });
        setCandidatos(Array.isArray(res) ? res : []);
      } catch {
        setCandidatos([]);
      }
    };
    cargar();
  }, [listAnimals, formData.especie]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validar código en tiempo real
    if (name === "codigo") {
      const v = value.trim();
      setFormData((p) => ({ ...p, codigo: v }));
      if (!v) setCodigoError("");
      else if (checkGroupExists && checkGroupExists(v)) {
        setCodigoError("Este código de grupo ya existe en tu empresa");
      } else {
        setCodigoError("");
      }
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAlimentacionChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      alimentacion: { ...p.alimentacion, [name]: value },
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setFormData((p) => ({ ...p, foto: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const toggleMiembro = (id) => {
    setFormData((p) => {
      const set = new Set(p.miembros);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, miembros: Array.from(set) };
    });
  };

  const objetivoOptions = useMemo(
    () => ["Carne", "Leche", "Trabajo", "Hobby", "Otros"],
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userCompany) {
      alert("Debes pertenecer a una empresa para crear grupos");
      return;
    }
    if (
      !formData.codigo ||
      !formData.nombre.trim() ||
      !formData.especie ||
      !formData.objetivo
    ) {
      alert("Completa los campos obligatorios (*)");
      return;
    }
    if (codigoError) {
      alert("Corrige el error en el código de grupo");
      return;
    }
    if (checkGroupExists && checkGroupExists(formData.codigo)) {
      alert("Este código de grupo ya existe");
      return;
    }

    setLoading(true);

    const grupoData = {
      codigo: formData.codigo,
      nombre: formData.nombre.trim(),
      especie: formData.especie, // Bovino/Ovino/Caprino
      objetivo: formData.objetivo,
      potrero: formData.potrero.trim() || null,
      foto: formData.foto || null,
      alimentacion: { ...formData.alimentacion },
      miembros: [...formData.miembros], // ids de animales
      // Puedes incluir más metadatos si tu backend/Context lo requiere:
      // empresaId: userCompany.id,
      // creadoPor: user?.id,
      // creadoEn: new Date().toISOString(),
    };

    try {
      const res = await Promise.resolve(addGroup(grupoData));
      setLoading(false);

      if (res?.success) {
        alert(`¡Grupo "${grupoData.nombre}" creado exitosamente!`);
        navigate("/App");
      } else {
        alert(res?.error || "No se pudo crear el grupo");
      }
    } catch (err) {
      setLoading(false);
      alert("Ocurrió un error al crear el grupo");
    }
  };

  const handleCancel = () => navigate("/App");

  if (!userCompany) {
    return (
      <div className="max-w-lg mx-auto mt-10 bg-white rounded-xl shadow-lg p-8 border-2 border-red-400">
        <h2 className="text-2xl font-bold text-red-700 mb-6">Acceso Restringido</h2>
        <p className="text-gray-700 mb-4">
          Para crear grupos, primero debes pertenecer a una empresa ganadera.
        </p>
        <button
          onClick={() => navigate("/company-view")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
        >
          Ir a Gestión de Empresa
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-green-400">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-green-700">Crear nuevo grupo</h2>
          <div className="text-sm text-gray-600">
            Empresa:{" "}
            <span className="font-semibold text-green-700">
              {userCompany.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-green-800 mb-2">
                Código de grupo *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ej: G-004"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none ${
                  codigoError
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-green-500"
                }`}
                required
              />
              {codigoError && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  ⚠️ {codigoError}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-green-800 mb-2">
                Nombre del grupo *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Bovinos en Engorde A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold text-green-800 mb-2">
                Especie *
              </label>
              <select
                name="especie"
                value={formData.especie}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              >
                <option value="">Selecciona</option>
                <option value="Bovino">Bovino</option>
                <option value="Ovino">Ovino</option>
                <option value="Caprino">Caprino</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-green-800 mb-2">
                Objetivo *
              </label>
              <select
                name="objetivo"
                value={formData.objetivo}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                required
              >
                <option value="">Selecciona</option>
                {objetivoOptions.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-green-800 mb-2">
                Potrero (opcional)
              </label>
              <input
                type="text"
                name="potrero"
                value={formData.potrero}
                onChange={handleInputChange}
                placeholder="Ej: Potrero La Esperanza"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Foto */}
          <div>
            <label className="block font-semibold text-green-800 mb-2">
              Foto / Icono del grupo (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
            />
            {formData.foto && (
              <div className="mt-2">
                <img
                  src={formData.foto}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-green-300"
                />
              </div>
            )}
          </div>

          {/* Alimentación inicial */}
          <fieldset className="border border-green-200 rounded-xl p-4">
            <legend className="px-2 text-green-700 font-bold">
              Alimentación inicial del grupo
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Tipo *</label>
                <input
                  name="tipo"
                  value={formData.alimentacion.tipo}
                  onChange={handleAlimentacionChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  placeholder="Pastoreo + suplemento mineral"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Cantidad *
                </label>
                <input
                  name="cantidad"
                  value={formData.alimentacion.cantidad}
                  onChange={handleAlimentacionChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  placeholder="8–12 kg MS/día"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Horario *
                </label>
                <input
                  name="horario"
                  value={formData.alimentacion.horario}
                  onChange={handleAlimentacionChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  placeholder="Mañana y tarde"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Suplemento *
                </label>
                <input
                  name="suplemento"
                  value={formData.alimentacion.suplemento}
                  onChange={handleAlimentacionChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  placeholder="Mezcla mineral ad libitum"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Costo por día
                </label>
                <input
                  name="costo"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.alimentacion.costo}
                  onChange={handleAlimentacionChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  placeholder="0.00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.alimentacion.observaciones}
                  onChange={handleAlimentacionChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500 min-h-20"
                  placeholder="Ajustar ración en lactancia / engorde"
                />
              </div>
            </div>
          </fieldset>

          {/* Miembros iniciales (si hay API) */}
          {listAnimals && formData.especie && (
            <fieldset className="border border-green-200 rounded-xl p-4">
              <legend className="px-2 text-green-700 font-bold">
                Miembros iniciales (opcional)
              </legend>
              {candidatos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay animales sin grupo en {formData.especie}.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto pr-1">
                  {candidatos.map((a) => {
                    const checked = formData.miembros.includes(a.identificacion || a.id);
                    const key = a.identificacion || a.id;
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 border rounded-lg px-3 py-2"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMiembro(key)}
                        />
                        <span className="text-sm">
                          <span className="font-semibold">{a.nombre || key}</span>{" "}
                          — {a.raza} — {a.pesoKg || a.peso} kg
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          )}

          {/* Acciones */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || !!codigoError}
              className={`font-semibold px-6 py-2 rounded-lg shadow transition ${
                loading || codigoError
                  ? "bg-gray-400 cursor-not-allowed text-gray-700"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Guardando..." : "Crear Grupo"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddGrupo;
