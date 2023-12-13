const Campground = require('../models/campground');
const s3 = require("../aws");

const mapbox = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mapbox({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

module.exports.newForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.create = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.geometry = geodata.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.location, filename: f.key }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.show = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
         path: "reviews",
         populate: {
             path: "author"
         }
    }).populate("author");
    if (!campground) {
         req.flash("error", "Cannot find that campground!");
         return res.redirect("/campgrounds");
    }
    console.log(campground);
    res.render('campgrounds/show', { campground });
};

module.exports.editForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    if (req.body.deleteImages) {
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })   
        for (let img of req.body.deleteImages) {
            await s3.deleteObject({
                Bucket: "yelp-camp-storage",
                Key: img
            }, function (err,data){}) 
        }  
    }
    const images = req.files.map(f => ({ url: f.location, filename: f.key }));
    campground.images.push(...images); 
    await campground.save();
    req.flash("success", "Successfully updated a campground!");
    res.redirect(`/campgrounds/${id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground!");
    res.redirect('/campgrounds');
};