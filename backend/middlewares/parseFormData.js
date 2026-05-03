const parseFormData = (req, res, next) => {
    // Parse location if it's a string
    if (req.body.location && typeof req.body.location === 'string') {
        try {
            req.body.location = JSON.parse(req.body.location);
        } catch (e) {
            // Ignore, let validation handle bad format
        }
    }

    // Parse required_skills if it's a string
    if (req.body.required_skills && typeof req.body.required_skills === 'string') {
        try {
            req.body.required_skills = JSON.parse(req.body.required_skills);
        } catch (e) {
            req.body.required_skills = req.body.required_skills.split(',');
        }
    }

    next();
};

module.exports = parseFormData;
