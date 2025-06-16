const {
    successResponse,
    failedResponse,
} = require("../utils");
const { MulterGridFSStorage } = require("../utils/gridfs");
const mongoose = require("mongoose");

module.exports = {
    getAssetById: async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return failedResponse(res, 400, "ID asset không hợp lệ");
            }

            const downloadStream = MulterGridFSStorage.getFileById(id);

            downloadStream.on('error', (error) => {
                if (error.code === 'ENOENT') {
                    return failedResponse(res, 404, "Không tìm thấy asset");
                }
                console.error("Error retrieving asset:", error);
                return failedResponse(res, 500, "Có lỗi xảy ra khi tải asset");
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
            console.error("Error in getAssetById:", error);
            return failedResponse(res, 500, "Có lỗi xảy ra khi lấy asset");
        }
    }
}; 