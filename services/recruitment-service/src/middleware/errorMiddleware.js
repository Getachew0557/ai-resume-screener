exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            message: 'Duplicate entry error',
            errors: err.errors.map(e => e.message)
        });
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.errors.map(e => e.message)
        });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error'
    });
};
