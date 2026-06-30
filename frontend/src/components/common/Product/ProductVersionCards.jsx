import { useNavigate } from "react-router-dom";

function ProductVersionCards({ products }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {products.map((product) =>
        product.productVersionResponses.map((version) => (
          <div
            key={version.idVersion}
            className="border rounded-lg shadow hover:shadow-lg cursor-pointer overflow-hidden transition"
            onClick={() => navigate(`/user/product/${product.idProduct}`)}
          >
            {/* Ảnh sản phẩm */}
            <img
              src={product.image}
              alt={product.productName}
              className="w-full h-48 object-cover"
            />

            {/* Tên phiên bản */}
            <div className="p-2 text-center">
              <h3 className="font-semibold text-gray-800">
                {product.nameProduct} - {version.ramName}/{version.romName} ({version.colorName})
              </h3>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default ProductVersionCards;
