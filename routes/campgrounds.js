const express = require('express');
const router = express.Router();

const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = require("../aws");
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'yelp-camp-storage',
        // acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + '-' + file.originalname)
        }
    })
});

const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("images"), validateCampground, catchAsync(campgrounds.create));

router.get('/new', isLoggedIn, campgrounds.newForm);

router.route('/:id')
    .get(catchAsync(campgrounds.show))
    .put(isLoggedIn, isAuthor, upload.array("images"), validateCampground, catchAsync(campgrounds.update))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editForm));


module.exports = router;