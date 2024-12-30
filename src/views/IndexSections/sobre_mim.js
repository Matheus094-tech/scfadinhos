import React, { useEffect } from "react";


// reactstrap components
import { Container, Row, Col } from "reactstrap";

export default function Sobre() {
  const bRHain = "https://brhain.com.br/";
  const badgeAws = "https://www.credly.com/badges/91e81db6-d3ff-4bcd-a931-9eacbfb6874e";

  return (
    <div className="section" id="sobre-mim">
      <Container style={{ fontSize: '18px' }}>
        <h2 data-aos="fade-up" className="title text-white">
          Sport Clube Fadinhos:
        </h2>
        <p data-aos="fade-up" className="text-white">
          Surgido durante a pandemia, o Sport Clube Fadinhos começou como Epidemic e, mais tarde, foi conhecido como Ruim é Pouco FC.
          Desde o início, a essência do clube foi a amizade e a diversão, formando um grande grupo de amigos que, mesmo em tempos difíceis, se uniram através do futebol.
          O time não se tratava apenas de jogar, mas de estar juntos, criando laços e compartilhando momentos únicos, mesmo à distância. Com o tempo, o clube evoluiu,
          mas sempre manteve o foco no companheirismo e nas memórias que cada partida proporciona.
          Hoje, o Sport Clube Fadinhos é muito mais que um time — é uma verdadeira família que nasceu da pandemia e cresceu com o espírito de união. ✨⚽
        </p>
        <Row>
          <Col md="12">
            <ul className="list-unstyled mt-2">
              <li data-aos="fade-up" className="py-2">
                Luan: <span class="fw-lighter">Talarico 🐍</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Pinho: <span class="fw-lighter">Talarico 2 🐍🐍</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Matheus: <span class="fw-lighter">Nerd 🤓</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Deco: <span class="fw-lighter">R.I.P ⚰️</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Jeh: <span class="fw-lighter">Analfabeto 📚❌</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Yago: <span class="fw-lighter">É CABO PORRA 💥💂‍♂️</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Rod: <span class="fw-lighter">Lancheiro 🥪</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Pedro: <span class="fw-lighter">Henrique 🤷‍♂️</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Penedo: <span class="fw-lighter">O menino fantasma 👻</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Laerte: <span class="fw-lighter">Tem deficiência, nasceu com 3 pernas 🦵🦵🦵</span>
              </li>
              <li data-aos="fade-up" className="py-2">
                Lele: <span class="fw-lighter">Tem deficiência também, só tem uma bola ⚽</span>
              </li>

            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
