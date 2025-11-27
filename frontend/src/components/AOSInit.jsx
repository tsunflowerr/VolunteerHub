import { useEffect } from 'react';
import AOS from 'aos';

const AOSInit = ({ children }) => {
  useEffect(() => {
    // Refresh AOS on route change
    AOS.refresh();
  }, []);

  return children;
};

export default AOSInit;
