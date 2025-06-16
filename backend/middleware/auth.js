module.exports.checkPermission = (resource, action) => (req, res, next) => {
  // TODO: Thêm logic phân quyền thực tế ở đây
  // Tạm thời cho phép tất cả request qua
  next();
}; 