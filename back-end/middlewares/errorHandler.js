export const errorHandler = (err, req, res, next) => {
  // console.error(err.stack);
  if (!req.body || Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid JSON or empty request body." });
  }
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
};

export default errorHandler; // Use ESM export
