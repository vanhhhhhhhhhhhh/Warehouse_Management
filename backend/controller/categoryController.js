const { successResponse, failedResponse, getPaginationParams, formatPaginatedResponse } = require("../utils");
const { Category } = require("../model");

module.exports = {
  listCategory: async (req, res) => {
    try {
      const { limit, skip } = getPaginationParams(req);
      const { name } = req.query;

      const query = {};

      if (name) {
        query.name = { $regex: name, $options: 'i' };
      }

      const categories = await Category
        .find(query)
        .select('_id name isDelete createdAt')
        .skip(skip)
        .limit(limit)
        .lean();

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
        .findById(id)
        .lean();

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

      const existingCategory = await Category.findOne({ name, isDelete: false });
      if (existingCategory) {
        return failedResponse(res, 400, 'Tên danh mục đã tồn tại');
      }

      const newCategory = new Category({
        name,
        adminId: req.user?.id
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

      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return failedResponse(res, 404, 'Không tìm thấy danh mục');
      }

      if (name && name !== existingCategory.name) {
        const duplicateCategory = await Category.findOne({ name, _id: { $ne: id }, isDelete: false });
        if (duplicateCategory) {
          return failedResponse(res, 400, 'Tên danh mục đã tồn tại');
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { name },
        { new: true, runValidators: true }
      );

      const mappedCategory = {
        _id: updatedCategory._id,
        name: updatedCategory.name,
        adminId: updatedCategory.adminId,
        isDelete: updatedCategory.isDelete,
        createdAt: updatedCategory.createdAt,
        updatedAt: updatedCategory.updatedAt
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

      await Category.updateMany({ _id: { $in: ids } }, { isDelete: true });

      return successResponse(res, 200, { message: 'Vô hiệu hóa danh mục thành công' });
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi vô hiệu hóa danh mục');
    }
  },

  activateCategories: async (req, res) => {
    try {
      const { ids } = req.body;

      await Category.updateMany({ _id: { $in: ids } }, { isDelete: false });

      return successResponse(res, 200, { message: 'Kích hoạt danh mục thành công' });
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Có lỗi xảy ra khi kích hoạt danh mục');
    }
  }
}
