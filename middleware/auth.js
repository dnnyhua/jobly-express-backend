"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when admin must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try{
    if (!res.locals.user || !res.locals.user.isAdmin) { 
      throw new UnauthorizedError();
    } 
    return next();
  } catch(err) {
    return next(err);
  }
}


function correctUserOrAdmin(req, res, next) {
  try{
    /**
     * checks to see if user is authenticated && if the correct user or admin is authenticated. 
     * Only user can update thier info or an admin.
     */
    if (!(res.locals.user && (res.locals.user.username === req.params.username || res.locals.user.isAdmin))) { 
      throw new UnauthorizedError();
    }
    return next()
  } catch(err) {
    return next(err)
  }

  // try {
  //   const user = res.locals.user;
  //   if (!(user && (user.isAdmin || user.username === req.params.username))) {
  //     throw new UnauthorizedError();
  //   }
  //   return next();
  // } catch (err) {
  //   return next(err);
  // }
}



module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  correctUserOrAdmin
};
