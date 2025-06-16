/** @import { type StorageEngine, type Multer } from 'multer' */
/** @import { type Connection } from 'mongoose' */
/** @import { type GridFSBucketReadStream } from 'mongodb' */

const { GridFSBucket } = require("mongodb");
const multer = require("multer");
const mongoose = require("mongoose");
const { failedResponse } = require("./index");

/**
 * Multer GridFS Storage crude implementation
 * @implements {StorageEngine}
 */
class MulterGridFSStorage {
  /**
   * Construct a new MulterGridFSStorage instance
   * @param {{ connection: Connection, bucketName: string }} options
   */
  constructor(options) {
    this.connection = options.connection;
    this.bucketName = options.bucketName;
    this.connection.on("connected", () => {
      this.gridFsBucket = new GridFSBucket(this.connection.db, {
        bucketName: options.bucketName,
      });
    });
  }

  /**
   * Get a file by its ID
   * @param {string} id - The ID of the file to get
   * @returns {GridFSBucketReadStream} - The file stream
   */
  getFileById(id) {
    return this.gridFsBucket.openDownloadStream(new mongoose.Types.ObjectId(id));
  }

  /** @type {StorageEngine['_handleFile']} */
  _handleFile(req, file, callback) {
    const writeStream = this.gridFsBucket.openUploadStream(file.originalname);

    file.stream.pipe(writeStream);
    writeStream.on("error", callback);
    writeStream.on("finish", () => {
      const fileInfo = {
        destination: this.bucketName,
        id: writeStream.id,
        filename: writeStream.filename,
        path: writeStream.id,
        size: writeStream.length,
      };

      callback(null, fileInfo);
    });
  }

  /** @type {StorageEngine['_removeFile']} */
  _removeFile(req, file, callback) {
    this.gridFsBucket
      .delete(file.id)
      .then(() => callback(null))
      .catch((err) => callback(err));
  }
}

exports.MulterImageStorage = new MulterGridFSStorage({
  connection: mongoose.connection,
  bucketName: "images",
});

const TRANSLATIONS = {
  "LIMIT_FILE_SIZE": "Kích thước file quá lớn",
}

const imageStorage = multer({
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sai định dạng file"), false);
    }
  },
  storage: exports.MulterImageStorage,
});

const singleImage = imageStorage.single("image");

exports.singleImage = (req, res, next) => {
  singleImage(req, res, (err) => {
    if (err) {
      console.error(err);
      return failedResponse(res, 400, TRANSLATIONS[err.code] || err.message);
    }

    next();
  });
}
