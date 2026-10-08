const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Jika error tidak operasional (seperti bug syntax), kita bisa menyembunyikan detailnya saat production
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Tambahkan custom logic misal jika error dari database (Postgres error code)
    if (error.code === '23505') { // Postgres unique violation (contoh username duplikat)
      error = new AppError('Data sudah ada (Duplicate field).', 400);
    }
    if (error.name === 'JsonWebTokenError') {
      error = new AppError('Token tidak valid. Silakan login kembali.', 401);
    }

    if (error.isOperational) {
      return res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      // Log error programming
      console.error('ERROR 💥', err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }

  // Pada saat development, tampilkan seluruh stack trace
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = errorHandler;
