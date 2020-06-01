const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './media');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '_' + file.originalname);
    }
});

let fileFilter = function (req, file, cb) {
    var allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb({
            success: false,
            message: 'Invalid file type. Only jpg, png image files are allowed.'
        }, false);
    }
};
let obj = {
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: fileFilter
};
const upload = multer(obj)

module.exports = upload;

