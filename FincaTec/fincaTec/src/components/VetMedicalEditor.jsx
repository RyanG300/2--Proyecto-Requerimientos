// src/components/VetMedicalEditor.jsx
import { useEffect, useState } from "react";
import { useUser } from "../UserContext";

export default function VetMedicalEditor({ animalId, open, onClose, onSaved }) {
  const { getAnimalAcrossCompanies, updateMedicalInfoGlobal } = useUser();
  const [loading, setLoading] = useState(false);
  const [animal, setAnimal] = useState(null);

  // Form sections (pendientes por guardar)
  const [vacuna, setVacuna] = useState({ nombre: "", fecha: "", dosis: "", notas: "" });
  const [enfermedad, setEnfermedad] = useState({ nombre: "", inicio: "", fin: "", notas: "" });
  const [proxVacuna, setProxVacuna] = useState({ nombre: "", fecha: "", notas: "" });
  const [tratamiento, setTratamiento] = useState({ nombre: "", farmaco: "", dosis: "", desde: "", hasta: "", notas: "" });

  useEffect(() => {
    if (!open) return;
    const a = getAnimalAcrossCompanies(animalId);
    setAnimal(a || null);
  }, [open, animalId, getAnimalAcrossCompanies]);

  if (!open) return null;

  const baseMed = () => ({
    historialVacunas: animal?.informacionMedica?.historialVacunas || [],
    historialEnfermedades: animal?.informacionMedica?.historialEnfermedades || [],
    proximasVacunas: animal?.informacionMedica?.proximasVacunas || [],
    tratamientosActivos: animal?.informacionMedica?.tratamientosActivos || [],
  });

  const addTo = async (fieldName, entry) => {
    if (!animal) return { success: false };
    setLoading(true);
    try {
      const med = baseMed();
      const patch = { ...med, [fieldName]: [...(med[fieldName] || []), entry] };
      const resp = await updateMedicalInfoGlobal(animal.id, patch);
      if (resp?.success) {
        setAnimal(resp.animal);
        return { success: true };
      }
      alert(resp?.error || "No se pudo actualizar");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    if (!animal) return;
    setLoading(true);
    try {
      const med = baseMed();
      const patch = { ...med };

      if (vacuna.nombre && vacuna.fecha) patch.historialVacunas = [...patch.historialVacunas, vacuna];
      if (enfermedad.nombre && enfermedad.inicio) patch.historialEnfermedades = [...patch.historialEnfermedades, enfermedad];
      if (proxVacuna.nombre && proxVacuna.fecha) patch.proximasVacunas = [...patch.proximasVacunas, proxVacuna];
      if (tratamiento.nombre && tratamiento.desde) patch.tratamientosActivos = [...patch.tratamientosActivos, tratamiento];

      const resp = await updateMedicalInfoGlobal(animal.id, patch);
      if (resp?.success) {
        setAnimal(resp.animal);
        onSaved && onSaved(resp.animal);
        onClose();
      } else {
        alert(resp?.error || "No se pudo guardar");
      }
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al guardar");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col">
        {/* Header sticky */}
        <div className="px-6 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-blue-700">
            Actualizar información médica — {animal?.nombre} ({animal?.id})
          </h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300">
            Cerrar
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="px-6 py-4 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4">
            {section("Historial de Vacunas", (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {input({ placeholder: "Nombre de vacuna", value: vacuna.nombre, onChange: e => setVacuna(v => ({ ...v, nombre: e.target.value })) })}
                  {input({ type: "date", value: vacuna.fecha, onChange: e => setVacuna(v => ({ ...v, fecha: e.target.value })) })}
                  {input({ placeholder: "Dosis", value: vacuna.dosis, onChange: e => setVacuna(v => ({ ...v, dosis: e.target.value })) })}
                </div>
                <div className="mt-2">{textarea({ placeholder: "Notas", value: vacuna.notas, onChange: e => setVacuna(v => ({ ...v, notas: e.target.value })) })}</div>
                <button
                  disabled={loading || !vacuna.nombre || !vacuna.fecha}
                  onClick={async () => {
                    const r = await addTo("historialVacunas", vacuna);
                    if (r.success) setVacuna({ nombre: "", fecha: "", dosis: "", notas: "" });
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  Agregar vacuna
                </button>
              </>
            ), "border-blue-300")}

            {section("Historial de Enfermedades", (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {input({ placeholder: "Nombre", value: enfermedad.nombre, onChange: e => setEnfermedad(v => ({ ...v, nombre: e.target.value })) })}
                  {input({ type: "date", value: enfermedad.inicio, onChange: e => setEnfermedad(v => ({ ...v, inicio: e.target.value })) })}
                  {input({ type: "date", value: enfermedad.fin, onChange: e => setEnfermedad(v => ({ ...v, fin: e.target.value })) })}
                </div>
                <div className="mt-2">{textarea({ placeholder: "Notas", value: enfermedad.notas, onChange: e => setEnfermedad(v => ({ ...v, notas: e.target.value })) })}</div>
                <button
                  disabled={loading || !enfermedad.nombre || !enfermedad.inicio}
                  onClick={async () => {
                    const r = await addTo("historialEnfermedades", enfermedad);
                    if (r.success) setEnfermedad({ nombre: "", inicio: "", fin: "", notas: "" });
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-rose-600 text-white disabled:opacity-50"
                >
                  Agregar enfermedad
                </button>
              </>
            ), "border-rose-300")}

            {section("Próximas Vacunas", (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {input({ placeholder: "Vacuna", value: proxVacuna.nombre, onChange: e => setProxVacuna(v => ({ ...v, nombre: e.target.value })) })}
                  {input({ type: "date", value: proxVacuna.fecha, onChange: e => setProxVacuna(v => ({ ...v, fecha: e.target.value })) })}
                </div>
                <div className="mt-2">{textarea({ placeholder: "Notas", value: proxVacuna.notas, onChange: e => setProxVacuna(v => ({ ...v, notas: e.target.value })) })}</div>
                <button
                  disabled={loading || !proxVacuna.nombre || !proxVacuna.fecha}
                  onClick={async () => {
                    const r = await addTo("proximasVacunas", proxVacuna);
                    if (r.success) setProxVacuna({ nombre: "", fecha: "", notas: "" });
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-amber-500 text-white disabled:opacity-50"
                >
                  Agendar próxima vacuna
                </button>
              </>
            ), "border-amber-300")}

            {section("Tratamientos Activos", (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {input({ placeholder: "Nombre", value: tratamiento.nombre, onChange: e => setTratamiento(v => ({ ...v, nombre: e.target.value })) })}
                  {input({ placeholder: "Fármaco", value: tratamiento.farmaco, onChange: e => setTratamiento(v => ({ ...v, farmaco: e.target.value })) })}
                  {input({ placeholder: "Dosis", value: tratamiento.dosis, onChange: e => setTratamiento(v => ({ ...v, dosis: e.target.value })) })}
                  {input({ type: "date", value: tratamiento.desde, onChange: e => setTratamiento(v => ({ ...v, desde: e.target.value })) })}
                  {input({ type: "date", value: tratamiento.hasta, onChange: e => setTratamiento(v => ({ ...v, hasta: e.target.value })) })}
                </div>
                <div className="mt-2">{textarea({ placeholder: "Notas", value: tratamiento.notas, onChange: e => setTratamiento(v => ({ ...v, notas: e.target.value })) })}</div>
                <button
                  disabled={loading || !tratamiento.nombre || !tratamiento.desde}
                  onClick={async () => {
                    const r = await addTo("tratamientosActivos", tratamiento);
                    if (r.success) setTratamiento({ nombre: "", farmaco: "", dosis: "", desde: "", hasta: "", notas: "" });
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50"
                >
                  Agregar tratamiento
                </button>
              </>
            ), "border-emerald-300")}
          </div>

          {/* Resumen actual */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Resumen actual</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <b>Vacunas:</b>
                <ul className="list-disc ml-5">
                  {(animal?.informacionMedica?.historialVacunas || []).map((v,i) => (
                    <li key={i}>{v.nombre} — {v.fecha} {v.dosis ? `(${v.dosis})` : ""}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <b>Enfermedades:</b>
                <ul className="list-disc ml-5">
                  {(animal?.informacionMedica?.historialEnfermedades || []).map((v,i) => (
                    <li key={i}>{v.nombre} — {v.inicio}{v.fin ? ` → ${v.fin}` : ""}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <b>Próximas vacunas:</b>
                <ul className="list-disc ml-5">
                  {(animal?.informacionMedica?.proximasVacunas || []).map((v,i) => (
                    <li key={i}>{v.nombre} — {v.fecha}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <b>Tratamientos:</b>
                <ul className="list-disc ml-5">
                  {(animal?.informacionMedica?.tratamientosActivos || []).map((v,i) => (
                    <li key={i}>{v.nombre} — {v.farmaco || '—'} {v.desde}{v.hasta ? ` → ${v.hasta}` : ""}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer sticky */}
        <div className="px-6 py-4 border-t sticky bottom-0 bg-white rounded-b-2xl z-10 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
            Cerrar
          </button>
          <button disabled={loading} onClick={saveAll} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
            Guardar todo
          </button>
        </div>
      </div>
    </div>
  );
}
