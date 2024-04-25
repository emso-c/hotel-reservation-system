function error (res, status_code, err_title, err_message) {
  console.log("Error: (" + status_code + ") " + err_title + " - " + err_message || 'An error occurred');
    return res.status(status_code).json({
        title: err_title,
        message: err_message || 'An error occurred'
    });
}

function json (res, status_code=200, data={}) {
    return res.status(status_code).json(data);
}


module.exports = {
    error,
    json
};
