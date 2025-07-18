const XLSX = require('xlsx')
const { failedResponse, successResponse } = require('../utils')
const mongoose = require('mongoose')
const { Product, Category } = require('../model')

const HEADER = ['Mã sản phẩm', 'Tên sản phẩm', 'Tên danh mục', 'Mô tả', 'Giá', 'Thuộc tính', 'Trạng thái'];

function isArraySame(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function parseAttributes(attr) {
  const ret = [];

  const items = attr.split(';');
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const indexOfEqual = item.indexOf('=');
    if (indexOfEqual === -1) {
      throw new Error(`Thuộc tính thứ ${i + 1} không hợp lệ: Không tìm thấy dấu =`);
    }

    const leftSide = item.slice(0, indexOfEqual).trim();
    const rightSide = item.slice(indexOfEqual + 1).trim();

    if (!leftSide) {
      throw new Error(`Thuộc tính thứ ${i + 1} không hợp lệ: Không tìm thấy tên thuộc tính`);
    }
    if (!rightSide) {
      throw new Error(`Thuộc tính thứ ${i + 1} không hợp lệ: Không tìm thấy giá trị thuộc tính`);
    }

    ret.push({
      name: leftSide,
      value: rightSide
    });
  }

  return ret;
}

/**
 *
 * @param {Array<Array<any>>} data
 * @param {boolean} stopOnError
 */
function convertAndValidate(data, stopOnError = true) {
  const ret = {
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    categories: [],
    documents: [],
    documentErrors: []
  }

  const categoriesMap = new Map();

  if (data.length === 0) {
    throw new Error('File không có dữ liệu');
  }

  const headerRow = data[0];
  if (!isArraySame(headerRow, HEADER)) {
    throw new Error('Header không đúng định dạng');
  }

  for (let i = 1; i < data.length; i++) {
    const rowData = data[i];
    const rowErrors = [];
    if (rowData.length !== HEADER.length) {
      documentErrors.push(`Dòng ${i + 1}: Số lượng cột không đúng, cần ${HEADER.length} cột`);
      if (stopOnError) {
        return ret;
      } else {
        continue;
      }
    }

    let attributes = [];
    if (rowData[5]) {
      try {
        attributes = parseAttributes(rowData[5]);
      } catch (error) {
        rowErrors.push(error.message);
      }
    }

    const code = rowData[0];

    const name = rowData[1];
    if (!name) {
      rowErrors.push(`Tên sản phẩm không được để trống`);
    }

    const categoryName = rowData[2];
    const description = rowData[3];

    const price = parseFloat(rowData[4]);
    if (isNaN(price) || price < 0) {
      rowErrors.push(`Giá không hợp lệ`);
    }
    const status = rowData[6];
    if (status !== 'Hoạt động' && status !== 'Không hoạt động') {
      rowErrors.push(`Trạng thái không hợp lệ`);
    }

    if (rowErrors.length > 0) {
      documentErrors.push(`Dòng ${i + 1}: ${rowErrors.join('\n')}`);

      if (stopOnError) {
        return ret;
      } else {
        continue;
      }
    }

    const document = {
      code,
      name,
      categoryName,
      description,
      price,
      attributes,
      status,
      lineNumber: i + 1
    };

    if (categoryName) {
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, []);
      }

      categoriesMap.get(categoryName).push(documents.length);
    }

    documents.push(document);
  }


  ret.totalRows = data.length - 1;
  ret.validRows = validRows;
  ret.invalidRows = invalidRows;
  ret.categories = categoriesMap.forEach((value, key) => {
    ret.categories.push({
      name: key,
      indices: value
    });
  });

  return ret;
}

async function importAll(convertedInfo, adminId { stopOnError, merge }) {
  const ret = {
    successCount: 0,
    errorCount: 0,
    importErrors: []
  };

  const ignoredList = [];
  const categoryNameToIdMap = new Map();

  for (const category of convertedInfo.categories) {
    const existingCategory = await Category.findOne({
      name: category.name,
      adminId
    }).exec();

    if (!existingCategory) {
      ignoredList.concat(category.indices);
      importErrors.push(`Danh mục "${category.name}" không tồn tại, bỏ qua ${category.indices.length} sản phẩm`);
      errorCount += category.indices.length;

      if (stopOnError) {
        return ret;
      }
    }

    categoryNameToIdMap.set(category.name, existingCategory._id);
  }

  for (let i = 0; i < convertedInfo.documents.length; i++) {
    const document = convertedInfo.documents[i];
    if (ignoredList.includes(i)) {
      continue;
    }

    const response = await Product.updateMany(
      { code: document.code, adminId },
      { $set: {
        code: document.code,
        name: document.name,
        cateId: categoryNameToIdMap.get(document.categoryName),
        description: document.description,
        price: document.price,
        attribute: document.attributes,
        image: null,
        isDelete: document.status !== 'Hoạt động',
        adminId,
      } },
      { upsert: true }
    );
  }

  return ret;
}

const defaultOptions = {
  stopOnError: true,
  merge: false
}

module.exports = {
  importFile: async (req, res) => {
    try {
      if (!req.file) {
        return failedResponse(res, 400, 'Không tìm thấy file')
      }

      const options = {
        ...defaultOptions,
        ...req.body.options || {}
      };

      const workbook = XLSX.read(req.file.buffer);
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
      let convertedInfo;

      try {
        convertedInfo = convertAndValidate(data, options.stopOnError);
      } catch (e) {
        return failedResponse(res, 400, e.message);
      }

      const { successCount, errorCount, importErrors } = await importAll(convertedInfo, req.user?.adminId, options);

      return successResponse(res, 200, {
        successCount,
        failedCount: errorCount + convertedInfo.invalidRows,
        formatErrors: convertedInfo.documentErrors,
        importErrors
      })
    } catch (error) {
      console.error(error);
      return failedResponse(res, 500, 'Lỗi khi xử lý file')
    }
  }
}
