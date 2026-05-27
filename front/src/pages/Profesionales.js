import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profesionales.css";
import logo from "../assets/logo.PNG";

const Profesionales = () => {
  const navigate = useNavigate();
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProfesionales();
  }, []);

  const cargarProfesionales = async () => {
    try {
      const response = await fetch("https://backend-a9gw.onrender.com/api/profesionales/publico");
      const data = await response.json();
      
      if (data.profesionales) {
        setProfesionales(data.profesionales);
      }
    } catch (error) {
      console.error("Error al cargar profesionales:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="profesionales-page">
        <section className="loading-container">
          <p>Cargando profesionales...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profesionales-page">
      <header className="profesionales-header">
        <div className="header-overlay"></div>
        <nav className="header-content">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Volver
          </button>
          <h1>Nuestros Profesionales</h1>
          <img src={logo} alt="BOOST Logo" className="header-logo" />
        </nav>
      </header>

      <section className="profesionales-container">
        {profesionales.length === 0 ? (
          <div className="no-profesionales">
            <p>No hay profesionales disponibles en este momento.</p>
          </div>
        ) : (
          <div className="profesionales-grid">
            {profesionales.map((prof) => (
              <article key={prof.idUsuario} className="profesional-card">
                <div className="card-header">
                  {prof.fotoPerfil ? (
                    <img src={prof.fotoPerfil} alt={prof.nombreCompleto || prof.nombre} className="prof-avatar" />
                  ) : (
                    <div className="prof-avatar-placeholder">
                      <span>{(prof.nombreCompleto || prof.nombre)?.charAt(0) || "P"}</span>
                    </div>
                  )}
                  <div className="prof-badge">Profesional</div>
                </div>

                <div className="card-body">
                  <h2 className="prof-name">{prof.nombreCompleto || prof.nombre}</h2>
                  <p className="prof-especialidad">💼 {prof.profesion}</p>
                  <p className="prof-ciudad">📍 {prof.ciudad}</p>
                  <p className="prof-experiencia">📊 {prof.experiencia} años de experiencia</p>
                  
                  {prof.bio && (
                    <p className="prof-bio">
                      {prof.bio.length > 100 ? `${prof.bio.substring(0, 100)}...` : prof.bio}
                    </p>
                  )}
                </div>

                <div className="card-footer">
                  <button 
                    onClick={() => navigate(`/profesional/${prof.idUsuario}`)}
                    className="btn-visitar"
                  >
                    Visitar perfil
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Profesionales;
