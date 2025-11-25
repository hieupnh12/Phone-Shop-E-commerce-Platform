// Products/index.jsx (minimal assembly)
import React from 'react';
import Header from '../../../components/layout/Header';
import ProductsContainer from '../../../components/common/Product/ProductContainer';
import Footer from "../../../components/layout/Footer";
import { Outlet } from 'react-router-dom';



const Products = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-12">
      <Header />
      <Outlet />
      {/* <ProductsContainer /> */}
      <Footer/> 
    </div>
  );
};

export default Products;
