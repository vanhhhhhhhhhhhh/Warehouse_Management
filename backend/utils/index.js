module.exports = {
  successResponse: (res, status = 200, data) => {
    if (typeof data !== 'object') {
      throw new TypeError('Data must be an object');
    }

    return res.status(status).json(data);
  },
  failedResponse: (res, status, message) => {
    return res.status(status).json({
      message
    })
  },
  formatPaginatedResponse: (data, totalPages) => {
    if (!Array.isArray(data)) {
      throw new TypeError('Data must be an array');
    }

    if (typeof totalPages !== 'number') {
      throw new TypeError('Total pages must be a number');
    }

    return {
      data,
      totalPages
    }
  },
  getPaginationParams: (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip
    }
  }
};