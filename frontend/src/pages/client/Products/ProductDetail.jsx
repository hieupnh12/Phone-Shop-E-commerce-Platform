import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, ChevronLeft, Zap } from 'lucide-react';
import Loading from '../../../components/common/Loading';
import Button from '../../../components/common/Button';
import cartService from '../../../services/cartService';
import productWorker from '../../../services/productWorker';
import { useLanguage } from '../../../contexts/LanguageContext';

const ProductDetail = () => {
  const { t } = useLanguage();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const product = await productWorker.fetchProductById(productId);
        setProduct(product);
        // Chọn version đầu tiên nếu có
        if (product?.versions?.length > 0) {
          setSelectedVersion(product.versions[0]);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(t('productDetailPage.failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Load favorite status
  useEffect(() => {
    if (product?.id) {
      const saved = localStorage.getItem('favorites');
      const favorites = saved ? JSON.parse(saved) : [];
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-12 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">{error || t('productDetailPage.notFound')}</h1>
            <Button onClick={() => navigate('/products')}>{t('productDetailPage.backToProducts')}</Button>
          </div>
        </div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
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

  const images = product.images || [product.image || 'https://via.placeholder.com/500'];
  const discountedPrice = product.discount
    ? (product.price * (1 - product.discount / 100)).toFixed(2)
    : product.price?.toFixed(2);

  const handleAddToCart = async () => {
    try {
      // Sử dụng selectedVersion nếu có, nếu không thì dùng version đầu tiên
      const versionToAdd = selectedVersion || product?.versions?.[0];
      if (!versionToAdd?.id) {
        alert(t('productDetailPage.noValidVersion'));
        return;
      }

      for (let i = 0; i < quantity; i++) {
        await cartService.addToCart(versionToAdd.id, 1);
      }
      alert(t('productDetailPage.addedToCart', { quantity }));
      setQuantity(1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert(t('productDetailPage.cannotAddToCart'));
    }
  };

  // Hàm xử lý "Mua ngay" - thêm vào giỏ hàng và chuyển đến cart với sản phẩm được chọn
  const handleBuyNow = async () => {
    try {
      // Sử dụng selectedVersion nếu có, nếu không thì dùng version đầu tiên
      const versionToAdd = selectedVersion || product?.versions?.[0];
      if (!versionToAdd?.id) {
        alert(t('productDetailPage.noValidVersion'));
        return;
      }

      // Thêm sản phẩm vào giỏ hàng với số lượng đã chọn
      await cartService.addToCart(versionToAdd.id, quantity);
      
      // Chuyển hướng đến trang giỏ hàng và truyền productVersionId để tự động chọn
      navigate('/user/cart', {
        state: {
          autoSelectProductVersionId: versionToAdd.id
        }
      });
    } catch (err) {
      console.error('Failed to buy now:', err);
      alert(t('productDetailPage.cannotAddToCart'));
    }
  };

  const handleToggleFavorite = () => {
    const saved = localStorage.getItem('favorites');
    let favorites = saved ? JSON.parse(saved) : [];
    if (isFavorite) {
      favorites = favorites.filter((id) => id !== product.id);
    } else {
      favorites.push(product.id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          {t('productDetailPage.backToProducts')}
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg overflow-hidden aspect-square">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500?text=No+Image';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{product.name}</h1>
              <div className="flex items-center gap-4">
                {renderStars(product.rating || 0)}
                <span className="text-gray-300">
                  {product.rating || 0} ({product.reviewCount || 0} {t('productDetailPage.reviews')})
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">${discountedPrice}</span>
                {product.discount && (
                  <>
                    <span className="text-xl text-gray-400 line-through">${product.price?.toFixed(2)}</span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                      -{product.discount}%
                    </span>
                  </>
                )}
              </div>
              {product.discount && (
                <p className="text-green-400 text-sm">
                  {t('productDetailPage.save')} ${(product.price - discountedPrice).toFixed(2)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span className={product.inStock ? 'text-green-400' : 'text-red-400'}>
                {product.inStock ? t('productDetailPage.inStock') : t('productDetailPage.outOfStock')}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{t('productDetailPage.description')}</h3>
                <p className="text-gray-300 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">{t('productDetailPage.specifications')}</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-gray-300">
                      <span className="font-medium">{key}:</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-white font-semibold">{t('productDetailPage.quantity')}:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.inStock}
                    className="px-3 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={!product.inStock}
                    className="w-12 text-center text-white bg-transparent border-l border-r border-gray-300 disabled:opacity-50"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock}
                    className="px-3 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  fullWidth
                  variant="primary"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  icon={ShoppingCart}
                >
                  {t('productDetailPage.addToCart')}
                </Button>
                <Button
                  fullWidth
                  variant="primary"
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                  icon={Zap}
                >
                  {t('productDetailPage.buyNow')}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  fullWidth
                  variant={isFavorite ? 'primary' : 'secondary'}
                  onClick={handleToggleFavorite}
                  icon={Heart}
                >
                  {isFavorite ? t('productDetailPage.saved') : t('productDetailPage.save')}
                </Button>
                <Button fullWidth variant="secondary" icon={Share2}>
                  {t('productDetailPage.share')}
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            {!product.inStock && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-200">{t('productDetailPage.currentlyOutOfStock')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section (optional) */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">{t('productDetailPage.relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {/* Related product cards would go here */}
              <p className="text-gray-300">Related products to be displayed here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
