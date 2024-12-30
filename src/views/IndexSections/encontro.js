import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import "./contador.css";

// reactstrap components
import { Container, Row, Col } from "reactstrap";

export default function Habilidades() {
  useEffect(() => {
    AOS.init();
  }, []);

  // Define o targetDate como 21/12/2024 às 00:00:00
  const targetDate = new Date("2024-12-21T00:00:00").getTime();

  // Inicializa o tempo restante com base na data atual do usuário (tempo desde 21/12/2024)
  const [timeLeft, setTimeLeft] = useState(targetDate - new Date().getTime());

  useEffect(() => {
    // Atualiza o contador a cada segundo
    const intervalId = setInterval(() => {
      setTimeLeft(targetDate - new Date().getTime());
    }, 1000);

    // Limpa o intervalo ao desmontar o componente
    return () => clearInterval(intervalId);
  }, [targetDate]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000); // Usa Math.abs para garantir que o tempo seja positivo
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`;
  };

  return (
    <div className="section" id="habilidades">
      <Container>
        <h2 style={{ color: "#fffda8", fontSize: '1.5rem' }} className="text-center title texto-piscando">
          Tempo desde o último encontro:
        </h2>
        <Row>
          <Col md="12" style={{ textAlign: "center" }}>
            <div className="text-center texto-piscando" style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#fffda8' }}>
              {formatTime(timeLeft)}
            </div>
          </Col>
        </Row>
        <Row>
          <Col md="12" data-aos="fade-up" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="wrapperTest">
  <div className="single-card">
    <div className="front">
      <img
        style={{ width: '400px', height: 'auto', objectFit: 'cover' }}
        src={require("assets/img/confra.jpeg")}
        alt="Evento de confraternização"
      />
    </div>
    <div className="back">
      <img
        className="img-raised"
        style={{ width: '400px', height: 'auto', objectFit: 'cover' }}
        src={require("assets/img/confra.jpeg")}
        alt="Evento de confraternização"
      />
      <div className="content">
        <h2>Confra de final de ano</h2>
        <p>Primeiro amigo secreto do Sport Club Fadinhos.</p>
      </div>
    </div>
  </div>
</div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
