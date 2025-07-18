const { successResponse, failedResponse, getPaginationParams, formatPaginatedResponse } = require("../utils");
const { Category } = require("../model");

module.exports = {
  listCategory: async (req, res) => {
    try {
      const { limit, skip } = getPaginationParams(req);
      const { name } = req.query;

      console.log(req.user)

      const query = {
        adminId: req.user?.adminId
      };

      if (name) {
        query.name = { $regex: name, $options: 'i' };
      }

      const categories = await Category
        .find(query)
        .select('_id name isDelete createdAt')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();

      const totalCategories = await Category.countDocuments(query);
      const totalPages = Math.ceil(totalCategories / limit);

      const mappedCategories = categories.map(category => ({
        _id: category._id,
        name: category.name,
        isDelete: category.isDelete,
        createdAt: category.createdAt
      }));

      const paginatedResponse = formatPaginatedResponse(mappedCategories, totalPages);

      return successResponse(res, 200, paginatedResponse);
    } catch (error) {
      return failedResponse(res, 500, error.message);
    }
  },

  getCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const category = await Category
        .findOne({ _id: id, adminId: req.user?.adminId })
        .lean()
        .exec();

      if (!category) {
        return failedResponse(res, 404, 'Không tìm thấy danh mục');
      }

      const mappedCategory = {
        _id: category._id,
        name: category.name,
        adminId: category.adminId,
        isDelete: category.isDelete,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
      };

      return successResponse(res, 200, mappedCategory);
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi lấy danh mục');
    }
  },

  createCategory: async (req, res) => {
    try {
      const { name } = req.body;

      const existingCategory = await Category.findOne({ name, adminId: req.user?.adminId }).lean().exec();
      if (existingCategory) {
        return failedResponse(res, 400, 'Tên danh mục đã tồn tại');
      }

      const newCategory = new Category({
        name,
        adminId: req.user?.adminId
      });

      const savedCategory = await newCategory.save();

      const mappedCategory = {
        _id: savedCategory._id,
        name: savedCategory.name,
        adminId: savedCategory.adminId,
        isDelete: savedCategory.isDelete,
        createdAt: savedCategory.createdAt,
        updatedAt: savedCategory.updatedAt
      };

      return successResponse(res, 201, mappedCategory);
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi tạo danh mục');
    }
  },

  updateCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const existingCategory = await Category.findOne({ _id: id, adminId: req.user?.adminId }).exec();
      if (!existingCategory) {
        return failedResponse(res, 404, 'Không tìm thấy danh mục');
      }

      if (name && name !== existingCategory.name) {
        const duplicateCategory = await Category
          .findOne({ name, _id: { $ne: id }, adminId: req.user?.adminId })
          .lean()
          .exec();
        if (duplicateCategory) {
          return failedResponse(res, 400, 'Tên danh mục đã tồn tại');
        }
      }

      existingCategory.name = name || existingCategory.name;
      await existingCategory.save();

      const mappedCategory = {
        _id: existingCategory._id,
        name: existingCategory.name,
        adminId: existingCategory.adminId,
        isDelete: existingCategory.isDelete,
        createdAt: existingCategory.createdAt,
        updatedAt: existingCategory.updatedAt
      };

      return successResponse(res, 200, mappedCategory);
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi cập nhật danh mục');
    }
  },

  deactivateCategories: async (req, res) => {
    try {
      const { ids } = req.body;

      await Category.updateMany({ _id: { $in: ids }, adminId: req.user?.adminId }, { isDelete: true }).exec();

      return successResponse(res, 200, { message: 'Vô hiệu hóa danh mục thành công' });
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi vô hiệu hóa danh mục');
    }
  },

  activateCategories: async (req, res) => {
    try {
      const { ids } = req.body;

      await Category.updateMany({ _id: { $in: ids }, adminId: req.user?.adminId }, { isDelete: false }).exec();

      return successResponse(res, 200, { message: 'Kích hoạt danh mục thành công' });
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi kích hoạt danh mục');
    }
  }
}
