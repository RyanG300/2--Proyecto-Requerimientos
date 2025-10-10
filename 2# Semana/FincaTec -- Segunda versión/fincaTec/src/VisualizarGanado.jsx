// src/VisualizarGanado.jsx
import { useParams, useNavigate } from "react-router-dom";
import { GANADO } from "./data";

function VisualizarGanado() {
  const { id } = useParams(); // Ejemplo: "B-001"
  const navigate = useNavigate();

  // Buscar el animal en cualquiera de las especies
  let animal = null;
  let especieEncontrada = "";

  for (const [especie, lista] of Object.entries(GANADO)) {
    const encontrado = lista.find((item) => item.id === id);
    if (encontrado) {
      animal = encontrado;
      especieEncontrada = especie;
      break;
    }
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center text-gray-700">
        <h2 className="text-3xl font-bold text-green-700 mb-4">
          No se encontró el animal con ID: {id}
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Volver al menú principal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white py-10">
      <div className="max-w-4xl mx-auto flex flex-row gap-10 justify-center">
        {/* Detalles del animal */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-300 flex flex-col items-center w-full max-w-md">
          <img
            src={animal.foto}
            alt={animal.nombre}
            className="w-36 h-36 object-cover rounded-xl border-2 border-green-400 mb-4"
          />
          <h2 className="text-3xl font-extrabold text-green-700 mb-4">
            {animal.nombre}
          </h2>
          <div className="w-full flex flex-col gap-2">
            <div className="font-bold text-green-800">
              Identificación única:{" "}
              <span className="font-normal text-gray-700">{animal.id}</span>
            </div>
            <div className="font-bold text-green-800">
              Especie:{" "}
              <span className="font-normal text-gray-700">
                {especieEncontrada}
              </span>
            </div>
            <div className="font-bold text-green-800">
              Raza:{" "}
              <span className="font-normal text-gray-700">{animal.raza}</span>
            </div>
            <div className="font-bold text-green-800">
              Sexo:{" "}
              <span className="font-normal text-gray-700">{animal.sexo}</span>
            </div>
            <div className="font-bold text-green-800">
              Fecha de nacimiento:{" "}
              <span className="font-normal text-gray-700">
                {animal.fechaNacimiento}
              </span>
            </div>
            <div className="font-bold text-green-800">
              Potrero actual:{" "}
              <span className="font-normal text-gray-700">
                {animal.potreroActual}
              </span>
            </div>
            <div className="font-bold text-green-800">
              Peso:{" "}
              <span className="font-normal text-gray-700">
                {animal.pesoKg} kg
              </span>
            </div>
          </div>
        </div>

        {/* Detalles del potrero asociado */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-300 flex flex-col items-center w-full max-w-md">
          <img
            src="/images/Potreros_relleno/potrero_1.png"
            alt={animal.potreroActual}
            className="w-36 h-36 object-cover rounded-xl border-2 border-green-400 mb-4"
          />
          <h2 className="text-3xl font-extrabold text-green-700 mb-4">
            {animal.potreroActual}
          </h2>
          <div className="w-full flex flex-col gap-2">
            <div className="font-bold text-green-800">
              Capacidad:{" "}
              <span className="font-normal text-gray-700">30 cabezas</span>
            </div>
            <div className="font-bold text-green-800">Ubicación:</div>
            <div className="ml-4 text-gray-700">
              Alajuela, San Carlos, Quesada, 500m norte de la plaza
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-bold text-green-800">Estado:</span>
              <span className="px-3 py-1 rounded-full bg-green-200 text-green-900 font-semibold text-sm flex items-center gap-1">
                <svg
                  className="w-4 h-4 inline"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="10" />
                </svg>
                Excelente calidad
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de regreso */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate(-1)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow font-semibold"
        >
          Volver
        </button>
      </div>
    </div>
  );
}

export default VisualizarGanado;
