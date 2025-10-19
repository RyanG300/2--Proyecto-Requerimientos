import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import VetMedicalEditor from "./components/VetMedicalEditor"; // ← asegúrate de esta ruta

export default function PerfilVeterinario() {
  const {
    user,
    logout,
    getAllPendingCitas,
    getAllVetCitas,
    acceptCita,
    completeCita,
    cancelCita,
    rejectCita, // ← nueva acción
  } = useUser();

  const navigate = useNavigate();
  const [disponibles, setDisponibles] = useState([]);
  const [asignadas, setAsignadas] = useState([]);

  // modal editor médico
  const [medOpen, setMedOpen] = useState(false);
  const [animalTarget, setAnimalTarget] = useState(null);

  const cargar = () => {
    setDisponibles(getAllPendingCitas());
    setAsignadas(getAllVetCitas(user?.email));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const formatFechaHora = (fecha, hora) => {
    try {
      const d = new Date(fecha);
      return `${d.toLocaleDateString()} ${hora || ""}`;
    } catch {
      return `${fecha || ""} ${hora || ""}`;
    }
  };

  const handleAceptar = async (cita) => {
    const r = await acceptCita(cita.id);
    if (r?.success) cargar();
  };

  const handleCompletar = async (cita) => {
    const r = await completeCita(cita.id);
    if (r?.success) cargar();
  };

  const handleCancelar = async (cita) => {
    const r = await cancelCita(cita.id);
    if (r?.success) cargar();
  };

  const handleRechazar = async (cita) => {
    const r = await rejectCita(cita.id);
    if (r?.success) cargar();
  };

  const abrirEditor = (cita) => {
    if (cita.tipo !== "individual") {
      alert("Para citas de grupo, abre el animal desde el módulo de ganado.");
      return;
    }
    setAnimalTarget(cita.objetivoId); // arete/ID del animal
    setMedOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow border border-green-300">
      <h1 className="text-2xl font-bold text-green-700 mb-4">Perfil del Veterinario</h1>

      <div className="flex justify-between mb-6">
        <div>
          <p><b>Nombre:</b> {user?.name}</p>
          <p><b>Correo:</b> {user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Citas disponibles */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-green-700 mb-3">Citas disponibles</h2>
        {disponibles.length === 0 ? (
          <p className="text-gray-500">No hay citas disponibles por ahora.</p>
        ) : (
          <div className="grid gap-3">
            {disponibles.map((c) => (
              <div key={c.id} className="p-4 border rounded-lg bg-yellow-50 flex justify-between">
                <div>
                  <p>
                    <b>{c.servicio === "chequeo" ? "Chequeo médico" : c.servicio}</b> — {c.objetivoNombre}
                  </p>
                  <p className="text-sm text-gray-600">{formatFechaHora(c.fechaCita, c.horaCita)}</p>
                  <p className="text-sm">Estado: <span className="font-semibold">{c.estado}</span></p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleAceptar(c)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => alert(JSON.stringify(c, null, 2))}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg text-sm"
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Citas asignadas */}
      <section>
        <h2 className="text-xl font-semibold text-green-700 mb-3">Citas asignadas a ti</h2>
        {asignadas.length === 0 ? (
          <p className="text-gray-500">No tienes citas asignadas aún.</p>
        ) : (
          <div className="grid gap-3">
            {asignadas.map((c) => (
              <div key={c.id} className="p-4 border rounded-lg bg-green-50">
                <div className="flex justify-between">
                  <div>
                    <p>
                      <b>{c.servicio === "chequeo" ? "Chequeo médico" : c.servicio}</b> — {c.objetivoNombre}
                    </p>
                    <p className="text-sm text-gray-600">{formatFechaHora(c.fechaCita, c.horaCita)}</p>
                    <p className="text-sm">Estado: <span className="font-semibold">{c.estado}</span></p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCompletar(c)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Completar
                    </button>
                    <button
                      onClick={() => handleCancelar(c)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleRechazar(c)}
                      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg text-sm"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => abrirEditor(c)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Actualizar info médica
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal para editar información médica del animal */}
      {medOpen && (
        <VetMedicalEditor
          animalId={animalTarget}
          open={medOpen}
          onClose={() => setMedOpen(false)}
          onSaved={() => {
            setMedOpen(false);
            cargar(); // refresca por si quieres ver cambios en la UI
          }}
        />
      )}
    </div>
  );
}
