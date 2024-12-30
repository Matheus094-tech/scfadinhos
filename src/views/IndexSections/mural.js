import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./mural.css";

// reactstrap components
import {
  Container,
  Row,
  Col,
} from "reactstrap";

export default function Curriculo() {
  useEffect(() => {
    AOS.init();
  }, []);


  return (

    <div className="section cv" id="curriculo">
      <Container>
        <h2 data-aos="fade-up" className="title text-white">
          Mural da vergonha
          <br></br>   <br></br>
          Os ARROMBADOS que não compareceram:
        </h2>
        <Row>
          <div className="section">
            <Container>
              <Row className="card-list">
                <Col md="4" className="card-item">
                  <div className="single-card">
                    <img
                      className="card-img"
                      src={require("assets/img/penedo.jpg")}
                      alt="Evento 1"
                    />
                    <div className="image-caption">
                      <p>André Penedo (Líder do vacilo, nunca foi visto)</p>
                    </div>
                  </div>
                </Col>
                <Col md="4" className="card-item">
                  <div className="single-card">
                    <img
                      className="card-img"
                      src={require("assets/img/matheus.jpg")}
                      alt="Evento 1"
                    />
                    <div className="image-caption">
                      <p>Matheus Barbosa (Na última e penúltima estava, menos mal)</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>

        </Row>
      </Container>
    </div>
  );
}
