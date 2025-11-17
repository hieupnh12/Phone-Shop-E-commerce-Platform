import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, ArrowRight } from 'lucide-react';
import Button from '../Button';

const CartTable = ({
  items = [],
  onQuantityChange,
  onRemoveItem,
  onProceedCheckout,
  isLoading = false,
}) => {
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = item.discount
        ? item.price * (1 - item.discount / 100)
        : item.price;
      return total + price * item.quantity;
    }, 0).toFixed(2);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0).toFixed(2);
  };

  const calculateSavings = () => {
    return items.reduce((total, item) => {
      if (item.discount) {
        const saving = item.price * (item.discount / 100) * item.quantity;
        return total + saving;
      }
      return total;
    }, 0).toFixed(2);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2-8m-10 8h8m0 0l2 2M17 21H7"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
        <p className="text-gray-600 mt-1">Add some items to get started</p>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const savings = calculateSavings();
  const total = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Price</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Quantity</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemPrice = item.discount
                ? (item.price * (1 - item.discount / 100)).toFixed(2)
                : item.price.toFixed(2);
              const itemTotal = (itemPrice * item.quantity).toFixed(2);

              return (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  {/* Product */}
                  <td className="py-4 px-4">
                    <div className="flex gap-4 items-start">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </p>
                        {item.discount && (
                          <p className="text-xs text-red-600 font-semibold mt-1">
                            {item.discount}% OFF
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <span className="font-semibold text-gray-900">${itemPrice}</span>
                      {item.discount && (
                        <span className="text-xs text-gray-500 line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quantity */}
                  <td className="py-4 px-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value);
                        if (newQuantity > 0) {
                          onQuantityChange?.(item.id, newQuantity);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Total */}
                  <td className="py-4 px-4 text-right">
                    <span className="font-bold text-gray-900">${itemTotal}</span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onRemoveItem?.(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors inline-flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal}</span>
        </div>
        {parseFloat(savings) > 0 && (
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Total Savings</span>
            <span>-${savings}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        fullWidth
        size="lg"
        variant="primary"
        loading={isLoading}
        onClick={onProceedCheckout}
        icon={ArrowRight}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

CartTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      discount: PropTypes.number,
    })
  ),
  onQuantityChange: PropTypes.func,
  onRemoveItem: PropTypes.func,
  onProceedCheckout: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default CartTable;
