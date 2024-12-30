import React from "react";
import "./agenda.css";
// reactstrap components
import { Container} from "reactstrap";

const eventos = [
  { mes: 'Janeiro/2025', responsavel: 'Mano Pinho', local: 'Condomínio do Pinho', data: 'A definir' },
  { mes: 'Fevereiro/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Março/2025', responsavel: 'Matheus Barbosa', local: 'A definir', data: 'A definir' },
  { mes: 'Abril/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Maio/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Junho/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Julho/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Agosto/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Setembro/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Outubro/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Novembro/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
  { mes: 'Dezembro/2025', responsavel: 'A definir', local: 'A definir', data: 'A definir' },
];

export default function Examples() {
  return (
    <div className="section">
      <Container className="text-center">
        <h2 data-aos="fade-down" className="title text-white">
          Agenda 2025 <br></br> Programe-se
        </h2>
        <div>
          {eventos.map((evento, index) => (
            <div key={index} className="month-section text-left">
              <span data-aos="fade-up" className="title text-white" style={{ fontSize: '22px' }}>
                • {evento.mes}
              </span>
              <ul>
                <li data-aos="fade-up" className="py-2" style={{ fontSize: '16px' }}>
                  Responsável: <span className="fw-lighter" style={{ fontSize: '16px' }}>{evento.responsavel}</span>
                </li>
                <li data-aos="fade-up" className="py-2" style={{ fontSize: '16px' }}>
                  Local: <span className="fw-lighter" style={{ fontSize: '16px' }}>{evento.local}</span>
                </li>
                <li data-aos="fade-up" className="py-2" style={{ fontSize: '16px' }}>
                  Data: <span className="fw-lighter" style={{ fontSize: '16px' }}>{evento.data}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
