"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json")
const jobSearchSchema = require("../schemas/jobSearchFilter.json");

// const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/**
 * Post a new job
 * 
 * job schema { title, salary, equity, companyHandle }
 * 
 * Returns { id, title, salary, equity, companyHandle }
 *  * 
 * only admin can add
 */

router.post("/", ensureAdmin, async (req, res, next) => {
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema)
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    }   catch (err) {
        return next(err);
    }

});


/**
 * GET /
 * { jobs: [ { id, title, salary, equity, companyHandle }
 * 
 * filters (req.query)
 * - minSalary
 * - hasEquity (true returns jobs with equity greater than 0)
 * - title (returns case insensitve match / partial match)
 * 
 * Anyone can search for jobs
 */


router.get("/", async (req, res, next) => {

     // q is going to be an object with filters as the keys; {name: "NotGoogle"}
  const q = req.query;

  // if minSalary included, convert string to integer
  if(q.minSalary !== undefined) q.minSalary = parseInt(q.minSalary)

  // if hasEquity convert string to boolean
  if(q.hasEquity) q.hasEquity = Boolean(q.hasEquity) 

    try {
        const validator = jsonschema.validate(q, jobSearchSchema)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs)
        }
        const jobs = await Job.findAllJobs(q)
        return res.status(201).json({jobs})
    }   catch (err) {
        return next(err);
    }
});






module.exports = router;