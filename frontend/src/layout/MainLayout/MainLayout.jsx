import React from 'react';
import { Outlet } from 'react-router';
import NavBar from '../../components/NavBar/NavBar';
import Footer from '../../components/Footer/Footer';
const MainLayout = () => {
  return (
    <>
      <NavBar></NavBar>
      <Outlet />
      <Footer></Footer>
    </>
  );
};

export default MainLayout;
