// src/pages/VisualizarGruposPastoreo.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { GANADO } from "./data.jsx";

export default function VisualizarGruposPastoreo() {
  const { tipo } = useParams(); // "Bovino" | "Ovino" | "Caprino"
  const navigate = useNavigate();

  // Normaliza el tipo (por si llega en minúsculas)
  const tipoKey =
    (tipo ?? "").charAt(0).toUpperCase() + (tipo ?? "").slice(1).toLowerCase();

  const lista = GANADO[tipoKey] ?? [];

  // 🟩 Config por defecto de alimentación por grupo (puedes moverlo a data.jsx si prefieres)
  const alimentacionDefault = useMemo(
    () => ({
      Bovino: {
        tipo: "Pastoreo (gramíneas/forraje) + suplemento mineral",
        cantidad: "8–12 kg MS/día (según peso y producción)",
        horario: "Mañana y tarde",
        suplemento: "Mezcla mineral ad libitum",
        observaciones: "Ajustar ración en lactancia / engorde",
      },
      Ovino: {
        tipo: "Pastoreo de pastos cortos y leguminosas + heno",
        cantidad: "2–4 kg MS/día",
        horario: "Dos tomas",
        suplemento: "Concentrado en crecimiento/lactancia",
        observaciones: "Evitar empaste; rotación de potreros",
      },
      Caprino: {
        tipo: "Ramoneo (arbustos/hojas) + pasto tierno y concentrado",
        cantidad: "2–3 kg MS/día",
        horario: "Mañana y tarde",
        suplemento: "Sales minerales específicas caprinas",
        observaciones: "Vigilancia de parásitos gastrointestinales",
      },
    }),
    []
  );

  // Estado: alimentación actual del grupo + historial local
  const [alimentacionActual, setAlimentacionActual] = useState(
    alimentacionDefault[tipoKey] ?? {
      tipo: "No definido",
      cantidad: "-",
      horario: "-",
      suplemento: "-",
      observaciones: "-",
    }
  );
  const [historial, setHistorial] = useState([]); // [{fecha, data}]

  // Helpers CRUD súper simples con prompt (puedes reemplazar por modal/form)
  const handleAdd = () => {
    const tipo = window.prompt(
      "Tipo de alimentación (ej: Pastoreo + suplemento):",
      alimentacionActual.tipo
    );
    if (tipo === null) return;

    const cantidad = window.prompt(
      "Cantidad (ej: 8–12 kg MS/día):",
      alimentacionActual.cantidad
    );
    if (cantidad === null) return;

    const horario = window.prompt(
      "Horario (ej: Mañana y tarde):",
      alimentacionActual.horario
    );
    if (horario === null) return;

    const suplemento = window.prompt(
      "Suplemento (ej: mezcla mineral):",
      alimentacionActual.suplemento
    );
    if (suplemento === null) return;

    const observaciones = window.prompt(
      "Observaciones:",
      alimentacionActual.observaciones
    );
    if (observaciones === null) return;

    const nueva = { tipo, cantidad, horario, suplemento, observaciones };
    setHistorial((h) => [
      { fecha: new Date().toISOString(), data: alimentacionActual },
      ...h,
    ]);
    setAlimentacionActual(nueva);
  };

  const handleEdit = () => {
    // Edita sobre la actual
    handleAdd();
  };

  const handleDelete = () => {
    if (!window.confirm("¿Eliminar la alimentación actual del grupo?")) return;
    setHistorial((h) => [
      { fecha: new Date().toISOString(), data: alimentacionActual },
      ...h,
    ]);
    setAlimentacionActual({
      tipo: "No definido",
      cantidad: "-",
      horario: "-",
      suplemento: "-",
      observaciones: "-",
    });
  };

  return (
    <main className="min-h-screen bg-green-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-green-700">
            {tipoKey ? `Ganado ${tipoKey}` : "Ganado"}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Volver
          </button>
        </div>

        {/* Layout principal: Panel de alimentación (izquierda) + tarjetas (derecha) */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* 📦 Panel izquierdo: Alimentación del grupo */}
          <aside className="lg:col-span-1 bg-white rounded-2xl border-2 border-green-300 shadow-lg p-6">
            <h2 className="text-2xl font-extrabold text-green-700 mb-2">
              Alimentación actual
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Grupo: <span className="font-semibold">{tipoKey}</span>
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
                onClick={handleAdd}
                className="px-4 py-2 rounded-full border-2 border-green-600 text-green-700 hover:bg-green-50"
              >
                Añadir
              </button>
              <button
                onClick={handleEdit}
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
                <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-gray-700">
                  {historial.map((h, idx) => (
                    <li key={idx}>
                      <span className="text-gray-500">
                        {new Date(h.fecha).toLocaleString()}
                      </span>
                      <div>
                        <span className="font-semibold">Tipo:</span>{" "}
                        <span className="italic">{h.data.tipo}</span> —{" "}
                        <span className="font-semibold">Cant.:</span>{" "}
                        {h.data.cantidad}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>

          {/* 🐄 Tarjetas derecha */}
          <section className="lg:col-span-3">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lista.map((animal) => (
                <article
                  key={animal.id}
                  className="bg-white rounded-2xl border-2 border-green-300 shadow-lg p-6"
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={animal.foto}
                      alt={animal.nombre}
                      className="w-28 h-28 object-cover rounded-xl border-4 border-green-200 shadow mb-4"
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
                      <span className="font-semibold">Especie:</span> {tipoKey}
                    </li>
                    <li>
                      <span className="font-semibold">Raza:</span>{" "}
                      {animal.raza}
                    </li>
                    <li>
                      <span className="font-semibold">Sexo:</span>{" "}
                      {animal.sexo}
                    </li>
                    <li>
                      <span className="font-semibold">
                        Fecha de nacimiento:
                      </span>{" "}
                      {animal.fechaNacimiento}
                    </li>
                    <li>
                      <span className="font-semibold">Potrero actual:</span>{" "}
                      {animal.potreroActual}
                    </li>
                    <li>
                      <span className="font-semibold">Peso:</span>{" "}
                      {animal.pesoKg} kg
                    </li>
                  </ul>
                </article>
              ))}
            </div>

            {lista.length === 0 && (
              <div className="mt-16 text-center text-gray-600">
                No hay registros para “{tipoKey}”.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
