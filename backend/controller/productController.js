const { successResponse, failedResponse, getPaginationParams, formatPaginatedResponse } = require("../utils");
const { Product } = require("../model");

module.exports = {
  listProduct: async (req, res) => {
    try {
      const { page, limit, skip } = getPaginationParams(req);

      const products = await Product
        .find()
        .populate('cateId', 'name')
        .select('_id code name price')
        .skip(skip)
        .limit(limit)
        .lean();

      const totalProducts = await Product.countDocuments();
      const totalPages = Math.ceil(totalProducts / limit);

      const mappedProducts = products.map(product => ({
        _id: product._id,
        code: product.code,
        name: product.name,
        category: product.cateId.name,
        price: product.price,
      }));

      const paginatedResponse = formatPaginatedResponse(mappedProducts, totalPages);

      return successResponse(res, 200, paginatedResponse);
    } catch (error) {
      return failedResponse(res, 500, error.message);
    }
  }
}