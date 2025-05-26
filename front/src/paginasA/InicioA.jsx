import React from "react";
import { useNavigate } from "react-router-dom";
import "./PaginasA.css";
import NavCub from "../componentes/navegacion";

function Inicio() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Agregar Admins",
      route: "/agregarAdminA",
      image: "./src/assets/adminicon.png",
      color: "#fbe1c7",
      borderColor: "#ed9235"
    },
    {
      title: "Status Socios",
      route: "/statusSociosA",
      image: "./src/assets/socioicon.png",
      color: "#b9e4fb",
      borderColor: "#56b3e4"
    },
  ];

  return (
    <div className="main">
      <NavCub />
      <h1 className="titulo">Inicio</h1>
      <div className="card-container">
        {cards.map((card, index) => (
          <div key={index} className="info-card" onClick={() => navigate(card.route)} style={{ backgroundColor: card.color, borderColor: card.borderColor }}>
            <img src={card.image} alt={card.title} />
            <div className="info-card-title">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inicio;
