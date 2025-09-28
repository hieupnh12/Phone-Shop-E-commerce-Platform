import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.image || '/api/placeholder/300/200'}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg mb-4"
        />
      </Link>
      
      <div className="space-y-2">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-600">
            ${product?.data?.price}
          </span>
          
          <button
            onClick={handleAddToCart}
            className="btn-primary text-sm"
          >
            Add to Cart
          </button>
        </div>
        
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-orange-500 text-sm">
            Only {product.stock} left in stock
          </p>
        )}
        
        {product.stock === 0 && (
          <p className="text-red-500 text-sm font-medium">
            Out of stock
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;