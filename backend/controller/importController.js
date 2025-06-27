const XLSX = require('xlsx')
const { failedResponse, successResponse } = require('../utils')
const mongoose = require('mongoose')
const { Product } = require('../model')

/**
 *
 * @param {Array<any>} row
 * @param {Map<string, number>} headerToColumnIndexMapping
 * @param {Map<string, string>} headerToFieldNameMapping
 * @returns {Record<string, any>}
 */
function mapRowToObject(row, headerToColumnIndexMapping, headerToFieldNameMapping) {
  if (!Array.isArray(row)) {
    throw new TypeError('row must be an array');
  }

  if (!(headerToColumnIndexMapping instanceof Map)) {
    throw new TypeError('headerToColumnIndexMapping must be a Map');
  }

  if (!(headerToFieldNameMapping instanceof Map)) {
    throw new TypeError('headerToFieldNameMapping must be a Map');
  }

  const result = {};

  for (const [headerLabel, columnIndex] of headerToColumnIndexMapping.entries()) {
    if (!headerToFieldNameMapping.has(headerLabel)) {
      continue;
    }

    const fieldName = headerToFieldNameMapping.get(headerLabel);
    let value = columnIndex < row.length ? row[columnIndex] : undefined;

    if (typeof value === 'string') {
      value = value.trim();
    }

    result[fieldName] = value;
  }

  return result;
}

/**
 * Splits an array into smaller arrays (batches) of a specified size.
 * @template T
 * @param {T[]} data The array to be batched.
 * @param {number} [batchSize=10] The size of each batch.
 * @returns {T[][]} An array of batches.
 */
function batchData(data, batchSize = 10) {
  if (!Array.isArray(data)) {
    throw new TypeError('data must be an array');
  }

  if (typeof batchSize !== 'number') {
    throw new TypeError('batchSize must be a number');
  }

  if (batchSize < 1) {
    throw new RangeError('batchSize must be at least 1');
  }

  const batches = [];

  for (let i = 0; i < data.length; i += batchSize) {
    batches.push(data.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * @typedef {{
 *  headerToColumnIndexMapping: Map<string, number>
 *  rowIndex: number
 * }} ParsedHeader
 */

/**
 * Find and return the first row considered the header row.
 * A header row is valid if all values are strings or numbers
 * Cells containing empty strings, NaN, non-finite numbers are skipped
 * @param {Array<Array<any>>} data - Entire sheet data in array of array format
 * @param {number} maxScan - Stop after scanning at most maxScan rows
 * @returns {ParsedHeader | null}
 */
function getHeader(data, maxScan = 100) {
  if (!Array.isArray(data)) {
    throw new TypeError('data must be an array');
  }

  if (typeof maxScan !== 'number') {
    throw new TypeError('maxScan must be a number');
  }

  if (maxScan < 1 || maxScan > 1000) {
    throw new RangeError('maxScan must be between 1 and 1000');
  }

  for (let i = 0; i < Math.min(data.length, maxScan); i++) {
    const row = data[i];

    /**
     * @type {Map<string, number>}
     */
    const mappings = new Map();

    /**
     * @type {Map<string, number>}
     */
    const duplicateCountMap = new Map();

    let validRow = true;

    for (let j = 0; j < row.length; j++) {
      let value = row[j];
      const isString = typeof value === 'string';
      const isNumber = typeof value === 'number';
      if (!isString && !isNumber) {
        validRow = false;
        break;
      }

      if (isString) {
        value = value.trim();

        if (value.length === 0) {
          continue;
        }
      }

      if (isNumber) {
        if (Number.isNaN(value) || !Number.isFinite(value)) continue;
      }

      if (!duplicateCountMap.has(value)) {
        duplicateCountMap.set(value, 0);
      } else {
        duplicateCountMap.set(value, duplicateCountMap.get(value) + 1);
      }

      let counterValue = duplicateCountMap.get(value);

      if (counterValue === 0) {
        mappings.set(value.toString(), j);
      } else {
        mappings.set(`${value.toString()} (${counterValue})`, j);
      }
    }

    if (validRow && mappings.size > 0) {
      return {
        headerToColumnIndexMapping: mappings,
        rowIndex: i
      }
    }
  }

  return null;
}

const BATCH_SIZE = 10;

module.exports = {
  createImport: async (req, res) => {
    try {
      if (!req.file) {
        return failedResponse(res, 400, 'Không tìm thấy file')
      }

      const workbook = XLSX.readFile(req.file.path);
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        return failedResponse(res, 400, 'Không tìm thấy sheet trong file Excel')
      }

      const sheet = workbook.Sheets[firstSheetName];
      const merges = sheet['!merges'];

      if (merges && merges.length > 0) {
        return failedResponse(res, 400, 'Không hỗ trợ các ô được gộp')
      }

      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const header = getHeader(data);
      if (!header) {
        return failedResponse(res, 400, 'Không tìm thấy header trong file Excel')
      }

      const { headerToColumnIndexMapping, rowIndex } = header;
      const batchesOfRows = batchData(data.slice(rowIndex + 1), BATCH_SIZE);

      const uploadId = new mongoose.Types.ObjectId();


      const headerMapping = Object.fromEntries(headerToColumnIndexMapping.entries());

      const headerDoc = new ExcelUpload({
        _id: uploadId,
        adminId: req.user.id,
        headerMapping
      });

      await headerDoc.save();

      for (const batch of batchesOfRows) {
        const excelUploadPart = new ExcelUploadPart({
          uploadId,
          batch
        });

        await excelUploadPart.save();
      }

      return successResponse(res, 200, {
        uploadId
      });
    } catch (error) {
      return failedResponse(res, 500, 'Lỗi khi xử lý file')
    }
  },
  finishImport: async (req, res) => {
    try {
      const { uploadId, mappings, options } = req.body;
      if (!uploadId) {
        return failedResponse(res, 400, 'Không tìm thấy uploadId')
      }

      if (!mongoose.Types.ObjectId.isValid(uploadId)) {
        return failedResponse(res, 400, 'uploadId không hợp lệ')
      }

      const headerDoc = await ExcelUpload.findById(uploadId).lean().exec();
      if (!headerDoc) {
        return failedResponse(res, 404, 'Không tìm thấy upload')
      }

      const parts = await ExcelUploadPart.find({ uploadId }).lean().exec();
      if (parts.length === 0) {
        return failedResponse(res, 404, 'Không tìm thấy dữ liệu')
      }

      const headerToFieldNameMapping = new Map(Object.entries(mappings));
      const headerToColumnIndexMapping = new Map(Object.entries(headerDoc.headerMapping));

      for (const part of parts) {
        const data = part.batch;
        const productToInsert = data.map(
          rowData => mapRowToObject(rowData, headerToColumnIndexMapping, headerToFieldNameMapping)
        );

        await Product.insertMany(productToInsert, { runValidators: true });
      }

      await ExcelUpload.findByIdAndDelete(uploadId).exec();
      await ExcelUploadPart.deleteMany({ uploadId }).exec();

      return successResponse(res, 200, {
        message: 'Import thành công'
      });
    } catch (error) {
      return failedResponse(res, 500, 'Lỗi khi xử lý file')
    }
  }
}