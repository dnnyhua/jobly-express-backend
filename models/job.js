"use strict";

const db = require("../db");

const { query } = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */


// CREATE TABLE jobs (
//     id SERIAL PRIMARY KEY,
//     title TEXT NOT NULL,
//     salary INTEGER CHECK (salary >= 0),
//     equity NUMERIC CHECK (equity <= 1.0),
//     company_handle VARCHAR(25) NOT NULL
//       REFERENCES companies ON DELETE CASCADE
//   );



class Job {
    /**
     * Create a new Job
     * data should be { title, salary, equity, companyHandle }
     * 
     * Return { title, salary, equity, companyHandle }
     */

    static async create({ title, salary, equity, companyHandle }) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4) 
            RETURNING id, title, salary, equity, company_handle as "companyHandle"`, 
            [title, salary, equity, companyHandle]
        );
        return result.rows
    };

    /**
     * Return all jobs in the database
     * 
     * filters
     * - minSalary
     * - hasEquity (true returns jobs with equity greater than 0)
     * - title (returns case insensitve match / partial match)
     * 
     * Returns { id, title, salary, equity, companyHandle }
     * 
     * enhancement: join companies and jobs table so that we can also return company name
     */

    // simple get all jobs function
    // static async getAllJobs() {
    //     const result = await db.query(
    //         `SELECT id, title, salary, equity, company_handle AS companyHandle
    //         FROM jobs `
    //     )
    //     console.log(result)
    //     return result.rows
    // }

    static async findAllJobs({minSalary, hasEquity, title} = {}) { 

        let query = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle AS companyHandle
                            FROM jobs`
        ;
        let queryValues = [];
        let whereClauses = [];
       

        // push each query values and where clauses into queryValues and whereClauses

        if(minSalary !== undefined) {
            queryValues.push(minSalary)
            whereClauses.push(`salary >= $${queryValues.length}`)
        }

        if (hasEquity === true) {
            whereClauses.push(`equity > 0`);
          }

        if(title !== undefined) {
            queryValues.push(`%${title}%`)
            whereClauses.push(`title ILIKE $${queryValues.length}`)
        }
        // add where clauses to the query
        if (whereClauses.length > 0) {
            query += " WHERE " + whereClauses.join(" AND ");
        }
        console.log(whereClauses)
        // add ORDER BY to the query
        query += " ORDER BY company_handle"

        const results = await db.query(query, queryValues)
        return results.rows
        



    }


}

module.exports = Job;