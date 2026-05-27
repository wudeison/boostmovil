import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BienveCliente.css"; // Usar el mismo CSS que BienveCliente
import logo from "../assets/logo.PNG";
import DisponibilidadProfesional from "./DisponibilidadProfesional";

const BienveProfesional = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [profesional, setProfesional] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [sesiones, setSesiones] = useState([]);
  const [loadingSesiones, setLoadingSesiones] = useState(false);

  // Cargar datos del profesional
  useEffect(() => {
    console.log("🔍 BienveProfesional - useEffect ejecutado");
    console.log("🔍 location.state:", location.state);
    
    setLoading(true);
    
    // Priorizar state de navegación
    if (location.state?.profesional) {
      console.log("✅ Cargando desde location.state:", location.state.profesional);
      setProfesional(location.state.profesional);
      // Actualizar localStorage también
      try {
        localStorage.setItem("profesional", JSON.stringify(location.state.profesional));
        localStorage.setItem("usuario", JSON.stringify(location.state.profesional));
        console.log("✅ Guardado en localStorage desde state");
      } catch (e) {
        console.error("❌ Error guardando en localStorage:", e);
      }
      setLoading(false);
      return;
    }
    
    // Intentar desde localStorage
    try {
      const stored = localStorage.getItem("profesional");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("✅ Cargando desde localStorage:", parsed);
        setProfesional(parsed);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("Error al cargar profesional:", e);
    }
    
    console.log("⚠️ No hay datos de profesional disponibles");
    // Si no hay datos, no hay profesional
    setProfesional(null);
    setLoading(false);
  }, [location.state]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar sesiones reservadas
  useEffect(() => {
    if (profesional?.idProfesional) {
      cargarSesiones();
    }
  }, [profesional]);

  const cargarSesiones = async () => {
    setLoadingSesiones(true);
    try {
      const response = await fetch(`https://backend-a9gw.onrender.com/api/reservas/profesional/${profesional.idProfesional}`);
      const data = await response.json();
      if (response.ok) {
        setSesiones(data.sesiones || []);
      } else {
        console.error("Error al cargar sesiones:", data.error);
      }
    } catch (error) {
      console.error("Error al cargar sesiones:", error);
    } finally {
      setLoadingSesiones(false);
    }
  };

  const formatearFecha = (fecha) => {
    try {
      if (!fecha) return "Fecha no disponible";
      const partes = fecha.split('T')[0].split('-');
      const [year, month, day] = partes;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatearHora = (hora) => {
    return hora?.substring(0, 5) || "";
  };

  const ordenarSesiones = (lista = []) => {
    return [...lista].sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.horaInicio || "00:00"}`);
      const fechaB = new Date(`${b.fecha}T${b.horaInicio || "00:00"}`);
      return fechaA - fechaB;
    });
  };

  const cancelarSesion = async (idSesion) => {
    if (!window.confirm("¿Estás seguro de cancelar esta sesión?")) {
      return;
    }

    try {
      const response = await fetch(`https://backend-a9gw.onrender.com/api/reservas/cancelar/${idSesion}?canceladoPor=profesional`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sesión cancelada exitosamente");
        cargarSesiones(); // Recargar lista
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al cancelar sesión:", error);
      alert("Error al cancelar la sesión");
    }
  };

  const eliminarSesionLocal = (idSesion) => {
    setSesiones((prev) => prev.filter((sesion) => sesion.idSesion !== idSesion));
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleLogout = () => {
    localStorage.removeItem("profesional");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const handleDeleteProfile = async () => {
    if (!profesional?.idUsuario) {
      alert("No encontramos el identificador del usuario");
      return;
    }

    const confirmacion = window.confirm("Esta acción eliminará tu perfil profesional y toda la información asociada. ¿Deseas continuar?");
    if (!confirmacion) return;

    try {
      const response = await fetch(`https://backend-a9gw.onrender.com/api/usuarios/${profesional.idUsuario}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.mensaje || data.error || "No se pudo eliminar el perfil");
      }

      localStorage.removeItem("profesional");
      localStorage.removeItem("usuario");
      alert("Tu perfil fue eliminado exitosamente");
      navigate("/");
    } catch (error) {
      console.error("Error al eliminar perfil:", error);
      alert(error.message || "Ocurrió un error al eliminar el perfil");
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Función para aceptar y ocultar la notificación
  const aceptarNotificacion = async (idSesion) => {
    try {
      await fetch(`https://backend-a9gw.onrender.com/api/reservas/notificacion/${idSesion}`, {
        method: "PUT",
      });
      cargarSesiones();
    } catch (error) {
      alert("Error al actualizar la notificación");
    }
  };

  const archivarSesionCancelada = async (idSesion) => {
    try {
      const response = await fetch(`https://backend-a9gw.onrender.com/api/reservas/archivar/${idSesion}?tipo=profesional`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo archivar la sesión");
      }

      setSesiones((prev) => prev.filter((sesion) => sesion.idSesion !== idSesion));
    } catch (error) {
      console.error(error);
      alert(error.message || "Error al archivar la sesión");
    }
  };

  const renderHabilidades = () => {
    if (!profesional?.habilidadesBlandas) return null;
    const habilidades = [];
    if (profesional.habilidadesBlandas.liderazgo) habilidades.push("Liderazgo");
    if (profesional.habilidadesBlandas.comunicacion) habilidades.push("Comunicación");
    if (profesional.habilidadesBlandas.trabajoEnEquipo) habilidades.push("Trabajo en equipo");
    if (profesional.habilidadesBlandas.resolucionProblemas) habilidades.push("Resolución de problemas");
    
    return habilidades.length > 0 ? habilidades.join(", ") : null;
  };

  const renderIdiomas = () => {
    if (!profesional?.idiomas) return null;
    const idiomas = [];
    if (profesional.idiomas.espanol) idiomas.push("Español");
    if (profesional.idiomas.ingles) idiomas.push("Inglés");
    if (profesional.idiomas.otros) idiomas.push(profesional.idiomas.otros);
    
    return idiomas.length > 0 ? idiomas.join(", ") : null;
  };

  const sesionesPendientes = ordenarSesiones(
    sesiones.filter((sesion) => sesion.estado !== "cancelada")
  );

  const sesionesCanceladas = ordenarSesiones(
    sesiones.filter((sesion) => sesion.estado === "cancelada")
  );

  if (loading) {
    return (
      <div className="profile-page">
        <div className="error-card">
          <h2>Cargando perfil...</h2>
        </div>
      </div>
    );
  }

  if (!profesional) {
    return (
      <div className="profile-page">
        <div className="error-card">
          <h2>No hay sesión activa</h2>
          <button onClick={() => navigate("/")} className="btn-home">Ir al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <main className="profile-page">
      {/* Header con gradiente */}
      <header className="profile-header">
        <div className="header-overlay"></div>
        <nav className="header-content">
          <div className="header-main">
            <img src={logo} alt="BOOST Logo" className="header-logo" />
            <div className="welcome-text-left">
              <h1>{getGreeting()}</h1>
              <p className="user-name">{profesional.nombreCompleto?.split(' ')[0] || profesional.nombre?.split(' ')[0] || 'Profesional'}</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="btn-logout">
              <span>🚪</span> Cerrar sesión
            </button>
            <button onClick={handleDeleteProfile} className="btn-delete-inline">
              🗑️ Eliminar perfil
            </button>
          </div>
        </nav>

        {/* Sesiones pendientes - Lado izquierdo */}
        <div className="sesiones-lateral sesiones-izquierda">
          <h3 className="sesiones-lateral-titulo">📋 Próximas Sesiones</h3>
          
          {loadingSesiones ? (
            <div className="loading-sesiones-lateral">
              <p>Cargando...</p>
            </div>
          ) : sesionesPendientes.length === 0 ? (
            <div className="sin-sesiones-lateral">
              <p>📭 Sin sesiones</p>
            </div>
          ) : (
            <div className="sesiones-lista">
              {sesionesPendientes.map((sesion) => (
                <div key={sesion.idSesion} className="sesion-card-lateral">
                  {sesion.estado !== 'cancelada' && (
                    <button 
                      className="btn-cancelar-sesion btn-cancelar-sesion-bottom" 
                      onClick={() => cancelarSesion(sesion.idSesion)}
                      title="Cancelar sesión"
                    >
                      🗑️
                    </button>
                  )}
                  <div className="sesion-fecha-hora">
                    <p className="fecha-texto">{formatearFecha(sesion.fecha)}</p>
                    <p className="hora-texto">{formatearHora(sesion.horaInicio)} - {formatearHora(sesion.horaFin)}</p>
                  </div>
                  <div className="sesion-detalles">
                    <p className="cliente-nombre">👤 {sesion.nombreCliente}</p>
                    <p className="monto-texto">💰 ${parseFloat(sesion.monto).toLocaleString('es-CO')}</p>
                  </div>
                  <span className={`estado-badge-lateral estado-${sesion.estado}`}>
                    {sesion.estado}
                  </span>
                  {/* Notificación de cancelación */}
                  {sesion.notificacionPendiente === 1 && (
                    <div className="notificacion-cancelacion">
                      {sesion.canceladoPor === 'cliente' && (
                        <>
                          <p>El cliente canceló la sesión. Se devolverá el 70% del valor pagado.</p>
                          <button className="btn-aceptar-notificacion" onClick={() => aceptarNotificacion(sesion.idSesion)}>Aceptar</button>
                        </>
                      )}
                      {sesion.canceladoPor === 'profesional' && (
                        <>
                          <p>Has cancelado esta sesión. El cliente puede reagendar con 30% de descuento.</p>
                          <button className="btn-aceptar-notificacion" onClick={() => aceptarNotificacion(sesion.idSesion)}>Aceptar</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sesiones canceladas - Lado derecho */}
        <div className="sesiones-lateral sesiones-derecha">
          <h3 className="sesiones-lateral-titulo">🗑️ Sesiones canceladas</h3>
          {loadingSesiones ? (
            <div className="loading-sesiones-lateral">
              <p>Cargando...</p>
            </div>
          ) : sesionesCanceladas.length === 0 ? (
            <div className="sin-sesiones-lateral">
              <p>📭 Sin cancelaciones</p>
            </div>
          ) : (
            <div className="sesiones-lista">
              {sesionesCanceladas.map((sesion) => (
                <div key={sesion.idSesion} className="sesion-card-lateral">
                  <button 
                    className="btn-cancelar-sesion btn-cancelar-sesion-bottom" 
                    onClick={() => archivarSesionCancelada(sesion.idSesion)}
                    title="Quitar de la lista"
                  >
                    🗑️
                  </button>
                  <div className="sesion-fecha-hora">
                    <p className="fecha-texto">{formatearFecha(sesion.fecha)}</p>
                    <p className="hora-texto">{formatearHora(sesion.horaInicio)} - {formatearHora(sesion.horaFin)}</p>
                  </div>
                  <div className="sesion-detalles">
                    <p className="cliente-nombre">👤 {sesion.nombreCliente}</p>
                    <p className="monto-texto">💰 ${parseFloat(sesion.monto).toLocaleString('es-CO')}</p>
                  </div>
                  <span className={`estado-badge-lateral estado-${sesion.estado}`}>
                    {sesion.estado}
                  </span>
                  {sesion.canceladoPor && (
                    <p className="cancelado-por-texto">
                      Cancelado por: {sesion.canceladoPor === 'profesional' ? 'Profesional' : 'Cliente'}
                    </p>
                  )}
                  {sesion.notificacionPendiente === 1 && (
                    <div className="notificacion-cancelacion">
                      {sesion.canceladoPor === 'cliente' && (
                        <>
                          <p>El cliente canceló la sesión. Se devolverá el 70% del valor pagado.</p>
                          <button className="btn-aceptar-notificacion" onClick={() => aceptarNotificacion(sesion.idSesion)}>Aceptar</button>
                        </>
                      )}
                      {sesion.canceladoPor === 'profesional' && (
                        <>
                          <p>Has cancelado esta sesión. El cliente puede reagendar con 30% de descuento.</p>
                          <button className="btn-aceptar-notificacion" onClick={() => aceptarNotificacion(sesion.idSesion)}>Aceptar</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Contenedor principal del perfil */}
      <section className="profile-content">
        {/* Card del perfil */}
        <article className="profile-card">
          {/* Avatar */}
          <div className="avatar-container">
            {profesional.fotoPerfil ? (
              <img src={profesional.fotoPerfil} alt="Avatar" className="profile-avatar" />
            ) : (
              <div className="avatar-placeholder">
                <span>{profesional.nombreCompleto?.charAt(0) || profesional.nombre?.charAt(0) || "P"}</span>
              </div>
            )}
            <div className="status-badge">⭐ Profesional</div>
          </div>

          {/* Información principal */}
          <div className="profile-main-info">
            <h2 className="profile-name">{profesional.nombreCompleto || profesional.nombre || "Profesional"}</h2>
            <p className="profile-type">💼 {profesional.profesion || "Profesional"}</p>
          </div>

          {/* Grid de información */}
          <div className="info-grid">
            {profesional.experiencia && (
              <div className="info-item">
                <span className="info-icon">📊</span>
                <div className="info-text">
                  <label>Experiencia</label>
                  <p>{profesional.experiencia} años</p>
                </div>
              </div>
            )}

            {profesional.correo && (
              <div className="info-item">
                <span className="info-icon">📧</span>
                <div className="info-text">
                  <label>Correo</label>
                  <p>{profesional.correo}</p>
                </div>
              </div>
            )}

            {profesional.telefono && (
              <div className="info-item">
                <span className="info-icon">📱</span>
                <div className="info-text">
                  <label>Teléfono</label>
                  <p>{profesional.telefono}</p>
                </div>
              </div>
            )}

            {profesional.ciudad && (
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div className="info-text">
                  <label>Ciudad</label>
                  <p>{profesional.ciudad}</p>
                </div>
              </div>
            )}

            {profesional.direccion && (
              <div className="info-item">
                <span className="info-icon">🏠</span>
                <div className="info-text">
                  <label>Dirección</label>
                  <p>{profesional.direccion}</p>
                </div>
              </div>
            )}

            {profesional.fechaNacimiento && (() => {
              const edad = calcularEdad(profesional.fechaNacimiento);
              return edad !== null && (
                <div className="info-item">
                  <span className="info-icon">🎂</span>
                  <div className="info-text">
                    <label>Edad</label>
                    <p>{edad} años</p>
                  </div>
                </div>
              );
            })()}

            {renderHabilidades() && (
              <div className="info-item">
                <span className="info-icon">💡</span>
                <div className="info-text">
                  <label>Habilidades blandas</label>
                  <p>{renderHabilidades()}</p>
                </div>
              </div>
            )}

            {renderIdiomas() && (
              <div className="info-item">
                <span className="info-icon">🌍</span>
                <div className="info-text">
                  <label>Idiomas</label>
                  <p>{renderIdiomas()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {profesional.bio && (
            <div className="profile-bio">
              <h3>📝 Sobre mí</h3>
              <p>{profesional.bio}</p>
            </div>
          )}

          {/* Botones de acción */}
          <nav className="profile-actions">
            <button onClick={() => navigate("/registroperfilprofesional", { state: { profesional } })} className="btn-edit">
              ✏️ Editar perfil
            </button>
            <button onClick={() => setShowModal(true)} className="btn-services">
              📅 Gestionar disponibilidad
            </button>
          </nav>
        </article>
      </section>

      {/* Modal de disponibilidad */}
      {showModal && (
        <DisponibilidadProfesional 
          profesional={profesional} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </main>
  );
};

export default BienveProfesional;
