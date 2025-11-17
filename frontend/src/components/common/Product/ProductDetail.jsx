import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, Heart, Share2, TrendingUp } from 'lucide-react';
import Button from '../Button';
import InputField from '../InputField';

const ProductDetail = ({
  product,
  onAddToCart,
  onFavorite,
  isFavorite = false,
  onBackClick,
  className = '',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    id,
    name,
    price,
    images = [],
    description = '',
    rating = 0,
    reviews = 0,
    discount = 0,
    inStock = true,
    sku = '',
    category = '',
    specifications = [],
  } = product;

  const discountedPrice = discount ? (price * (1 - discount / 100)).toFixed(2) : price;
  const savingAmount = discount ? (price - discountedPrice).toFixed(2) : 0;

  const mainImage = images[selectedImage] || 'https://via.placeholder.com/500?text=No+Image';

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAddToCart = () => {
    onAddToCart?.({ id, quantity });
    setQuantity(1);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
    <div className={`${className}`}>
      {/* Back Button */}
      {onBackClick && (
        <button
          onClick={onBackClick}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500?text=No+Image';
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
                {category && (
                  <p className="text-sm text-gray-600 mt-1">Category: {category}</p>
                )}
              </div>
              {onFavorite && (
                <button
                  onClick={() => onFavorite(id)}
                  className={`p-3 rounded-full transition-colors ${
                    isFavorite
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              {renderStars(rating)}
              <span className="text-gray-600">
                {rating} ({reviews} {reviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="border-y border-gray-200 py-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">${discountedPrice}</span>
              {discount && (
                <>
                  <span className="text-xl text-gray-500 line-through">${price.toFixed(2)}</span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            {discount && (
              <p className="text-green-600 text-sm font-semibold mt-2">
                Save ${savingAmount}
              </p>
            )}
          </div>

          {/* Description */}
          {description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
          )}

          {/* Specifications */}
          {specifications.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
              <div className="space-y-2">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{spec.key}</span>
                    <span className="text-gray-900 font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                inStock ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={inStock ? 'text-green-600' : 'text-red-600'}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-grow flex gap-3">
              <Button
                fullWidth
                size="lg"
                variant="primary"
                disabled={!inStock}
                onClick={handleAddToCart}
                icon={TrendingUp}
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                icon={Share2}
              >
                Share
              </Button>
            </div>
          </div>

          {/* SKU */}
          {sku && (
            <p className="text-xs text-gray-500">SKU: {sku}</p>
          )}
        </div>
      </div>
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    rating: PropTypes.number,
    reviews: PropTypes.number,
    discount: PropTypes.number,
    inStock: PropTypes.bool,
    sku: PropTypes.string,
    category: PropTypes.string,
    specifications: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }).isRequired,
  onAddToCart: PropTypes.func,
  onFavorite: PropTypes.func,
  isFavorite: PropTypes.bool,
  onBackClick: PropTypes.func,
  className: PropTypes.string,
};

export default ProductDetail;
