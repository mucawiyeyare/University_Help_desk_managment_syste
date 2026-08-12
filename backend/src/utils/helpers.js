exports.asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.sendResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.paginate = async (model, query, page = 1, limit = 10, populate = []) => {
  const startIndex = (page - 1) * limit;
  const total = await model.countDocuments(query);
  let queryObj = model.find(query).skip(startIndex).limit(limit);
  
  if (populate.length) {
    populate.forEach(pop => {
      queryObj = queryObj.populate(pop);
    });
  }
  
  const results = await queryObj;
  
  return {
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    limit: parseInt(limit),
    results
  };
};

// Extract pagination params from query string
exports.getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// Build pagination metadata object
exports.paginateResults = (total, page, limit) => {
  return {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit,
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
};
