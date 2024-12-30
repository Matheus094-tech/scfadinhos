import React from "react";

// reactstrap components
import { Container } from "reactstrap";
import { TypeAnimation } from "react-type-animation";

export default function PageHeader() {
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
        </div>
      </Container>
    </div>
  );
}
