'use client'
import { useMediaQuery } from "react-responsive";
import DesktopFooter from "./DesktopFooter";
import MobileFooter from "./MobileFooter";

const Footer = () => {
  const isMobile = useMediaQuery({ maxWidth: 700 }); // adjust breakpoint
  return isMobile ? <MobileFooter /> : <DesktopFooter />;
};

export default Footer;
