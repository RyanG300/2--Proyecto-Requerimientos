// src/pages/VisualizarGruposPastoreo.jsx
import { useParams, useNavigate } from "react-router-dom";
import { GANADO } from "./data.jsx";

export default function VisualizarGruposPastoreo() {
  const { tipo } = useParams(); // "Bovino" | "Ovino" | "Caprino"
  const navigate = useNavigate();

  // Normaliza el tipo (por si llega en minúsculas)
  const tipoKey =
    (tipo ?? "").charAt(0).toUpperCase() + (tipo ?? "").slice(1).toLowerCase();

  const lista = GANADO[tipoKey] ?? [];

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

        {/* Grid de tarjetas */}
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
                  <span className="font-semibold">Raza:</span> {animal.raza}
                </li>
                <li>
                  <span className="font-semibold">Sexo:</span> {animal.sexo}
                </li>
                <li>
                  <span className="font-semibold">Fecha de nacimiento:</span>{" "}
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

                {/* 🐮 Tipo de alimentación */}
                <li className="mt-2">
                  <span className="font-semibold text-green-700">
                    Tipo de alimentación:
                  </span>{" "}
                  <span className="italic text-gray-800">
                    {animal.tipoAlimentacion || "No especificado"}
                  </span>
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
      </div>
    </main>
  );
}
