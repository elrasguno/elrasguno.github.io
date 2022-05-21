const path = require('path');
const config = require('../../../shared/config');
const constants = require('@tryghost/constants');
const themeEngine = require('../../services/theme-engine');
const express = require('../../../shared/express');

function isDeniedFile(file) {
    const deniedFileTypes = ['.hbs', '.md', '.json'];
    const ext = path.extname(file);

    return deniedFileTypes.includes(ext);
}

function isAllowedFile(file) {
    const allowedFiles = ['manifest.json'];
    const base = path.basename(file);

    return allowedFiles.includes(base);
}

function forwardToExpressStatic(req, res, next) {
    if (!themeEngine.getActive()) {
        return next();
    }

    const configMaxAge = config.get('caching:theme:maxAge');

    express.static(themeEngine.getActive().path,
        {maxAge: (configMaxAge || configMaxAge === 0) ? configMaxAge : constants.ONE_YEAR_MS}
    )(req, res, next);
}

function staticTheme() {
    return function denyStatic(req, res, next) {
        if (!isAllowedFile(req.path) && isDeniedFile(req.path)) {
            return next();
        }

        return forwardToExpressStatic(req, res, next);
    };
}

module.exports = staticTheme;
