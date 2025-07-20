const {
  successResponse,
  failedResponse,
  getPaginationParams,
  formatPaginatedResponse,
} = require("../utils");
const { Product } = require("../model");

module.exports = {
  listProduct: async (req, res) => {
    try {
      const { limit, skip } = getPaginationParams(req);

      const query = {
        adminId: req.user?.adminId || req.user?._id
      };

      if (req.query.name) {
        query.name = { $regex: req.query.name, $options: "i" };
      }

      if (req.query.status) {
        query.isDelete = req.query.status !== 'active';
      }

      const products = await Product.find(query)
        .populate("cateId", "name")
        .select("_id code name price isDelete")
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      const mappedProducts = products.map((product) => ({
        _id: product._id,
        code: product.code,
        name: product.name,
        category: product.cateId.name,
        price: product.price,
        isDelete: product.isDelete,
      }));

      const paginatedResponse = formatPaginatedResponse(
        mappedProducts,
        totalPages,
      );

      return successResponse(res, 200, paginatedResponse);
    } catch (error) {
      return failedResponse(res, 500, error.message);
    }
  },

  getProduct: async (req, res) => {
    try {
      const { id } = req.params;

      const product = await Product.findOne({ _id: id, adminId: req.user?.adminId })
        .populate("cateId", "_id")
        .lean()
        .exec();

      if (!product) {
        return failedResponse(res, 404, "Không tìm thấy sản phẩm");
      }

      const mappedProduct = {
        _id: product._id,
        code: product.code,
        name: product.name,
        categoryId: product.cateId?._id,
        description: product.description,
        price: product.price,
        attributes: product.attribute,
        imageId: product.image,
        adminId: product.adminId,
        isDelete: product.isDelete,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      return successResponse(res, 200, mappedProduct);
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, "Có lỗi xảy ra khi lấy sản phẩm");
    }
  },

  createProduct: async (req, res) => {
    try {
      const {
        code,
        name,
        categoryId,
        description,
        price,
        attributes,
        isDelete,
      } = req.body;


      const existingProduct = await Product.findOne({ code, adminId: req.user?.adminId }).lean().exec();
      if (existingProduct) {
        return failedResponse(res, 400, "Mã sản phẩm đã tồn tại");
      }

      const newProduct = new Product({
        code,
        name,
        cateId: categoryId,
        description,
        price: parseFloat(price),
        attribute: attributes,
        image: req.file?.id ?? null,
        isDelete: isDelete === "true",
        adminId: req.user?.adminId,
      });

      const savedProduct = await newProduct.save();

      await savedProduct.populate("cateId", "name");

      const mappedProduct = {
        _id: savedProduct._id,
        code: savedProduct.code,
        name: savedProduct.name,
        categoryId: savedProduct.cateId?._id,
        description: savedProduct.description,
        price: savedProduct.price,
        attributes: savedProduct.attribute,
        imageId: savedProduct.image,
        adminId: savedProduct.adminId,
        isDelete: savedProduct.isDelete,
        createdAt: savedProduct.createdAt,
        updatedAt: savedProduct.updatedAt,
      };

      return successResponse(res, 201, mappedProduct);
    } catch (error) {
      if (error.code === 11000) {
        return failedResponse(res, 400, "Mã sản phẩm đã tồn tại");
      }
      console.error(error);
      return failedResponse(res, 500, "Có lỗi xảy ra khi tạo sản phẩm");
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        code,
        name,
        categoryId,
        description,
        price,
        attributes,
        isDelete,
      } = req.body;

      const existingProduct = await Product.findOne({ _id: id, adminId: req.user?.adminId }).exec();
      if (!existingProduct) {
        return failedResponse(res, 404, "Không tìm thấy sản phẩm");
      }

      if (code && code !== existingProduct.code) {
        const duplicateProduct = await Product.findOne({
          code,
          _id: { $ne: id },
          adminId: req.user?.adminId,
        }).lean().exec();

        if (duplicateProduct) {
          return failedResponse(res, 400, "Mã sản phẩm đã tồn tại");
        }
      }

      const updateData = {
        code: code,
        name: name,
        cateId: categoryId,
        description: description,
        price: price,
        attribute: attributes,
        image: req.file ? req.file.id : existingProduct.image,
        isDelete: isDelete,
      };

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("cateId", "name");

      const mappedProduct = {
        _id: updatedProduct._id,
        code: updatedProduct.code,
        name: updatedProduct.name,
        categoryId: updatedProduct.cateId?._id,
        description: updatedProduct.description,
        price: updatedProduct.price,
        attributes: updatedProduct.attribute,
        imageId: updatedProduct.image,
        adminId: updatedProduct.adminId,
        isDelete: updatedProduct.isDelete,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      };

      return successResponse(res, 200, mappedProduct);
    } catch (error) {
      if (error.code === 11000) {
        return failedResponse(res, 400, "Mã sản phẩm đã tồn tại");
      }
      console.error(error);
      return failedResponse(res, 500, "Có lỗi xảy ra khi cập nhật sản phẩm");
    }
  },

  deactivateProduct: async (req, res) => {
    try {
      const { ids } = req.body;

      await Product.updateMany({ _id: { $in: ids }, adminId: req.user?.adminId }, { isDelete: true }).exec();

      return successResponse(res, 200, {
        message: "Hủy kích hoạt sản phẩm thành công",
      });
    } catch (error) {
      console.error(error);
      return failedResponse(
        res,
        500,
        "Có lỗi xảy ra khi hủy kích hoạt sản phẩm",
      );
    }
  },

  activateProduct: async (req, res) => {
    try {
      const { ids } = req.body;

      await Product.updateMany({ _id: { $in: ids }, adminId: req.user?.adminId }, { isDelete: false }).exec();

      return successResponse(res, 200, {
        message: "Kích hoạt sản phẩm thành công",
      });
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, "Có lỗi xảy ra khi kích hoạt sản phẩm");
    }
  },
};
