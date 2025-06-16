const {
  successResponse,
  failedResponse,
} = require("../utils");
const { MulterImageStorage } = require("../utils/gridfs");
const mongoose = require("mongoose");

module.exports = {
  getImageById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return failedResponse(res, 400, "ID image không hợp lệ");
      }

      const downloadStream = MulterImageStorage.getFileById(id);

      downloadStream.on('error', (error) => {
        if (error.code === 'ENOENT') {
          return failedResponse(res, 404, "Không tìm thấy image");
        }
        console.error("Error retrieving image:", error);
        return failedResponse(res, 500, "Có lỗi xảy ra khi tải image");
      });

      downloadStream.on('file', (file) => {
        res.set({
          'Content-Type': file.contentType || 'application/octet-stream',
          'Content-Length': file.length,
          'Content-Disposition': `inline; filename="${file.filename}"`,
        });
      });

      downloadStream.pipe(res);

    } catch (error) {
      console.error("Error in getImageById:", error);
      return failedResponse(res, 500, "Có lỗi xảy ra khi lấy image");
    }
  }
};
