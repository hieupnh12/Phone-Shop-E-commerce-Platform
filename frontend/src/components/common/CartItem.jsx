import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onQuantityChange, onRemove, labels = {} }) => {
  const { id, name, price, image, quantity, discount } = item;
  const discountedPrice = discount ? price * (1 - discount / 100) : price;
  const total = (discountedPrice * quantity).toFixed(2);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0) {
      onQuantityChange(id, newQuantity);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/80?text=No+Image';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {discount && <span className="text-red-500 font-semibold">{discount}% {labels.off || 'OFF'}</span>}
          {discount && <span className="mx-2 line-through text-gray-400">${price.toFixed(2)}</span>}
          <span className="font-semibold text-gray-900">${discountedPrice.toFixed(2)}</span>
        </p>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label={labels.decreaseQuantity || "Decrease quantity"}
        >
          <Minus size={16} className="text-gray-600" />
        </button>
        <span className="w-6 text-center font-semibold text-gray-900">{quantity}</span>
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label={labels.increaseQuantity || "Increase quantity"}
        >
          <Plus size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Total Price */}
      <div className="text-right flex flex-col justify-between min-w-[100px]">
        <div className="font-bold text-lg text-gray-900">${total}</div>
        <button
          onClick={() => onRemove(id)}
          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors self-end"
          aria-label={labels.removeItem || "Remove item"}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    discount: PropTypes.number,
  }).isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  labels: PropTypes.shape({
    off: PropTypes.string,
    decreaseQuantity: PropTypes.string,
    increaseQuantity: PropTypes.string,
    removeItem: PropTypes.string,
  }),
};

export default CartItem;
