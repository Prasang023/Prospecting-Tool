// Standardize API responses
const successResponse = (data, message = 'Success') => {
    return {
        success: true,
        message,
        data
    };
};

const errorResponse = (message, error = null) => {
    return {
        success: false,
        message,
        error: error ? error.message : null
    };
};

module.exports = { successResponse, errorResponse }; 