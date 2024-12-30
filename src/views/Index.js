import React from "react";

// core components
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import PageHeader from "components/PageHeader/PageHeader.js";
import Footer from "components/Footer/Footer.js";

// sections for this page/view
import Sobre from "views/IndexSections/sobre_mim";
import Mural from "views/IndexSections/mural.js";
import Encontro from "views/IndexSections/encontro.js";
import Agenda from "views/IndexSections/agenda.js";

export default function Index() {
  React.useEffect(() => {
    document.body.classList.toggle("index-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("index-page");
    };
  }, []);
  return (
    <>
      <IndexNavbar />
      <div className="wrapper">
        <PageHeader />
        <div className="main">
          <Sobre />
          <Encontro />
          <Mural />
          <Agenda />
        </div>
        <Footer />
      </div>
    </>
  );
}
