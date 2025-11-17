import React from 'react';
import PropTypes from 'prop-types';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Button from '../Button';
import Tooltip from '../Tooltip';

const ProductCard = ({
  product,
  onAddToCart,
  onFavorite,
  onViewDetail,
  isFavorite = false,
  showRating = true,
  className = '',
}) => {
  const { id, name, price, image, discount, rating, inStock } = product;

  const discountedPrice = discount ? (price * (1 - discount / 100)).toFixed(2) : price;
  const savingAmount = discount ? (price - discountedPrice).toFixed(2) : 0;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className={`group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {/* Image Container */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />

        {/* Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <Tooltip content="View Detail" position="bottom">
            <button
              onClick={() => onViewDetail?.(id)}
              className="p-2 bg-white text-gray-900 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
              aria-label="View detail"
            >
              <Eye size={20} />
            </button>
          </Tooltip>

          <Tooltip content="Add to Favorites" position="bottom">
            <button
              onClick={() => onFavorite?.(id)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-900 hover:bg-red-500 hover:text-white'
              }`}
              aria-label="Add to favorites"
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </Tooltip>

          <Tooltip content="Add to Cart" position="bottom">
            <button
              onClick={() => onAddToCart?.(id)}
              disabled={!inStock}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add to cart"
            >
              <ShoppingCart size={20} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors cursor-pointer">
          {name}
        </h3>

        {/* Rating */}
        {showRating && rating && (
          <div className="mt-2 flex items-center gap-2">
            {renderStars(rating)}
            <span className="text-xs text-gray-600">({rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">${discountedPrice}</span>
          {discount && (
            <>
              <span className="text-sm text-gray-500 line-through">${price.toFixed(2)}</span>
              <span className="text-xs text-green-600 font-semibold">Save ${savingAmount}</span>
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          fullWidth
          size="sm"
          variant={inStock ? 'primary' : 'secondary'}
          disabled={!inStock}
          onClick={() => onAddToCart?.(id)}
          className="mt-4"
          icon={ShoppingCart}
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
    discount: PropTypes.number,
    rating: PropTypes.number,
    inStock: PropTypes.bool,
  }).isRequired,
  onAddToCart: PropTypes.func,
  onFavorite: PropTypes.func,
  onViewDetail: PropTypes.func,
  isFavorite: PropTypes.bool,
  showRating: PropTypes.bool,
  className: PropTypes.string,
};

export default ProductCard;
