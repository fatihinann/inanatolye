import React from "react";
import Container from "@mui/material/Container";

function PageContainer({ children, className, maxWidth }) {
  return (
    <Container className={`${className || ""}`}>
      {children}
    </Container>
  );
}

export default PageContainer;
