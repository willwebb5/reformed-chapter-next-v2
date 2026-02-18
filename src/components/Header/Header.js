// Header.js
'use client'
import { useMediaQuery } from 'react-responsive';
import DesktopHeader from './DesktopHeader';
import MobileHeader from './MobileHeader';

const Header = () => {
  const isMobile = useMediaQuery({ maxWidth: 700 });
  return isMobile ? <MobileHeader /> : <DesktopHeader />;
};

export default Header;
