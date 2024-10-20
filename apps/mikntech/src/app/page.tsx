"use client";

import { PaletteMode, ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import NavBar from "./components/NavBar";
import Hero from "./components/Hero";
import Faq from "./components/FAQ";
import Footer from "./components/Footer";
import React, { useEffect, useState } from "react";
import Value from "./components/Value";
import Model from "./components/Model";
import Who from "./components/Who";
import Contact from "./components/Contact";

export default function Page() {
  const [mode, setMode] = useState<PaletteMode>("light");
  const defaultTheme = createTheme({ palette: { mode } });

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setMode(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline enableColorScheme />
      <NavBar mode={mode} />
      <Hero />
      <div>
        <div id="value">
          <Value />
        </div>
        <div id="model">
          <Model />
        </div>
        <div id="faq">
          <Faq />
        </div>
        <div id="who">
          <Who />
        </div>
        <div id="contact">
          <Contact />
        </div>
        <Divider />
        <Footer mode={mode} />
      </div>
    </ThemeProvider>
  );
}
