import React from "react";
import { FaInstagram, FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "../css/footer.scss";
function Footer() {
  return (
    <footer>
      <h3>İletişim ve Destek</h3>
      <div className="section">
        <div className="mail">
          <FaEnvelope />
          <p>fatihinan3437@gmail.com</p>
        </div>
        <div>
          <span className="socials">
            <FaInstagram />
            <FaGithub />
            <FaLinkedin />
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
