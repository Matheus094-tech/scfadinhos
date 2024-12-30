import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";



// reactstrap components
import { Col, Container, Row } from "reactstrap";
import { TypeAnimation } from "react-type-animation";


export default function PageHeader() {

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
    <div className="page-header header-filter">
      <div className="squares square1" />
      <div className="squares square2" />
      <div className="squares square3" />
      <div className="squares square4" />
      <div className="squares square5" />
      <div className="squares square6" />
      <div className="squares square7" />
      <Container>
        <div className="content-center brand">
          <h1 className="h1-seo">Sport Club Fadinhos</h1>
          <TypeAnimation
            preRenderFirstString={true}
            sequence={[
              "Pior time de Pro que já existiu",
              1500,
              "",
              500,
              "Pior",
              500,
              "Pior time",
              500,
              "Pior time de Pro que já existiu",
              500,
              "Pior time",
              500,
              "Pior",
              500,
              "",
              500,

            ]}
            wrapper="h2"
            repeat={Infinity}
          />
             <h2 style={{ color: "#fffda8", fontSize: '1.5rem' }} className="text-center title">
          Tempo desde o último encontro:
        </h2>
        <Row>
          <Col md="12" style={{ textAlign: "center" }}>
            <div className="text-center texto-piscando" style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#fffda8' }}>
              {formatTime(timeLeft)}
            </div>
          </Col>
          </Row>
        </div>
    
      </Container>
    </div>
  );
}
