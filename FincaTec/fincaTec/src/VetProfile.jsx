// src/VetProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findVetById, upsertVet } from "./vets/storage";

export default function VetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vet, setVet] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const found = findVetById(id);
    if (!found) {
      // si no existe, vuelve al inicio o a listado
      navigate("/");
      return;
    }
    setVet(found);
  }, [id, navigate]);

  if (!vet) return null;

  const handleChange = (path, value) => {
    setVet(prev => {
      const copy = structuredClone(prev);
      const segs = path.split(".");
      let ref = copy;
      for (let i = 0; i < segs.length - 1; i++) ref = ref[segs[i]];
      ref[segs.at(-1)] = value;
      return copy;
    });
  };

  const save = () => {
    upsertVet(vet);
    setEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow p-6 border border-green-300">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-green-700">
          Perfil del Veterinario
        </h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={save}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg border"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Datos personales */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Nombre"
          value={vet.fullName}
          editable={editing}
          onChange={(v) => handleChange("fullName", v)}
        />
        <Field label="Correo" value={vet.email} editable={false} />
        <Field
          label="Teléfono"
          value={vet.phone}
          editable={editing}
          onChange={(v) => handleChange("phone", v)}
        />
      </section>

      <hr className="my-6" />

      {/* Perfil profesional */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="N° de licencia"
          value={vet.profile.licenseNumber}
          editable={editing}
          onChange={(v) => handleChange("profile.licenseNumber", v)}
        />
        <Field
          label="Especialidad"
          value={vet.profile.specialty || ""}
          editable={editing}
          onChange={(v) => handleChange("profile.specialty", v)}
        />
        <Field
          label="Clínica"
          value={vet.profile.clinicName}
          editable={editing}
          onChange={(v) => handleChange("profile.clinicName", v)}
        />
        <Field
          label="Dirección de la clínica"
          value={vet.profile.clinicAddress || ""}
          editable={editing}
          onChange={(v) => handleChange("profile.clinicAddress", v)}
        />
      </section>

      <div className="mt-4">
        <Field
          label="Bio"
          value={vet.profile.bio || ""}
          editable={editing}
          textarea
          onChange={(v) => handleChange("profile.bio", v)}
        />
      </div>
    </div>
  );
}

function Field({ label, value, editable, onChange, textarea }) {
  return (
    <div>
      <label className="block font-semibold text-green-800 mb-1">{label}</label>
      {editable ? (
        textarea ? (
          <textarea
            className="w-full border rounded-lg px-3 py-2 outline-none min-h-[100px]"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="w-full border rounded-lg px-3 py-2 outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : textarea ? (
        <p className="whitespace-pre-line border rounded-lg px-3 py-2 bg-gray-50">{value || "—"}</p>
      ) : (
        <div className="border rounded-lg px-3 py-2 bg-gray-50">{value || "—"}</div>
      )}
    </div>
  );
}
