import React, { useState } from 'react';
import { ArrowLeft, Truck, Tag, CreditCard, Plus, Minus, X } from 'lucide-react';

export default function ShoppingCart() {
  const [items, setItems] = useState([
    { id: 1, name: 'lavender foam hand soap', variant: 'lavender', price: 4.00, quantity: 2, color: 'bg-pink-200' },
    { id: 2, name: 'method men bar soap', variant: 'sea + surf', price: 4.00, quantity: 2, color: 'bg-yellow-200' },
    { id: 3, name: 'lemon mint foam hand soap', variant: 'lemon mint', price: 4.00, quantity: 2, color: 'bg-cyan-100' }
  ]);

  const updateQuantity = (id, delta) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const processingFee = 2.00;
  const total = subtotal + processingFee;

  return (
    <div className=" bg-gray-300 p-4">
      <div className="max-w-8xl mx-auto bg-white rounded-3xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-12">
          {/* Left Column - Shopping Cart */}
          <div className="col-span-2">
            <h1 className="text-4xl font-bold mb-8">shopping cart</h1>

            {/* Offers */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="relative">
                <div className="bg-purple-600 text-white p-5 rounded-2xl">
                  <Truck className="w-7 h-7 mb-2" />
                  <p className="text-xs font-bold mb-1 uppercase">GET FREE SHIPPING</p>
                  <p className="text-lg font-bold">VND 25.00</p>
                </div>
                <div className="absolute -top-2 -right-2 bg-purple-700 rounded-full p-1.5">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <div className="bg-yellow-400 h-2 rounded-full mt-3"></div>
              </div>

              <div className="relative">
                <div className="bg-purple-600 text-white p-5 rounded-2xl">
                  <Tag className="w-7 h-7 mb-2" />
                  <p className="text-xs font-bold mb-1 uppercase">SAVE EXTRA 5% OFF</p>
                  <p className="text-lg font-bold">VND 40.00</p>
                </div>
                <div className="absolute -top-2 -right-2 bg-purple-700 rounded-full p-1.5">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </div>
                <div className="bg-yellow-400 h-2 rounded-full mt-3"></div>
              </div>

              <div className="relative">
                <div className="bg-gray-100 text-gray-800 p-5 rounded-2xl">
                  <CreditCard className="w-7 h-7 mb-2" />
                  <p className="text-xs font-bold mb-1 uppercase">GET A FREE DOPP KIT</p>
                  <p className="text-lg font-bold">VND 50.00</p>
                </div>
                <div className="bg-yellow-400 h-2 rounded-full mt-3 w-1/4"></div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className={`${item.color} w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <div className="w-10 h-12 bg-white/60 rounded-lg"></div>
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.variant}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-10 h-10 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-10 text-center font-bold text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-10 h-10 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="w-24 text-right font-bold text-lg">
                    VND {item.price.toFixed(2)}
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-span-1">
            <h2 className="text-4xl font-bold mb-8">summary</h2>

            <div className="bg-gray-300 rounded-2xl p-8 space-y-5">
              {/* Coupon Code */}
              <div className="flex justify-between items-center pb-5 border-b border-gray-200">
                <span className="text-gray-600 font-medium">coupon code</span>
                <span className="text-gray-400">0000</span>
              </div>

              <div className="flex justify-between items-center pb-5 border-b border-gray-200">
                <span className="text-gray-400">e-voucher</span>
                <button className="text-purple-600 font-bold text-sm">+ add</button>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-900 font-semibold">subtotal</span>
                <span className="font-bold text-lg">VND {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">other processing fee</span>
                <span className="text-gray-400">VND {processingFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center pb-5 border-b border-gray-200">
                <span className="text-gray-400">est taxes</span>
                <span className="text-gray-400">—</span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3">
                <span className="text-gray-900 font-semibold">total</span>
                <span className="font-bold text-lg">VND {total.toFixed(2)}</span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-300">
                <span className="text-2xl font-bold">grand total</span>
                <span className="text-2xl font-bold">VND {total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-full mt-8 transition-colors text-lg">
                proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}