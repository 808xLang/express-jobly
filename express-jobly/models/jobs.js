'use strict';

const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate, getSqlWhereJobFilters } = require('../helpers/sql');



class Job {

  // makes a job and returns the new Job data
  // { title, salary, equity, company_handle }
  // if correct should return the same thing including the id
  
    static async create({ title, salary, equity, companyHandle }) {
      const result = await db.query(
        `INSERT INTO jobs
             (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [title, salary, equity, companyHandle]
      );
      const job = result.rows[0];
  
      return job;
    }
  

    // get jobs
    // return [{id, title, salary, equity, company_handle }]
    static async findAll(filter) {
      const sqlWhere = getSqlWhereJobFilters(filter ? filter : {});
  
      const jobsRes = await db.query(
        `SELECT id, title, salary, equity, company_handle AS "companyHandle"
         FROM jobs
         ${sqlWhere}`
      );
      return jobsRes.rows;
    }
  


    // give a job id
    // Returns all the info about a job basically everything the id the title the salary
    // if nothing is found then returns an error
  
    static async get(id) {
      const jobRes = await db.query(
        `SELECT id, title, salary, equity, company_handle AS "companyHandle"
         FROM jobs
         WHERE id = $1`,
        [id]
      );
  
      const job = jobRes.rows[0];
  
      if (!job) throw new NotFoundError(`No Job: ${id}`);
  
      return job;
    }
  

    // Takes the data that needs to be changed and changes it
    // title, salary, equity, and company_handle
  
    static async update(id, data) {
      const { setCols, values } = sqlForPartialUpdate(data, {
        companyHandle: 'company_handle',
      });
      const idVarIdx = '$' + (values.length + 1);
  
      const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
      const result = await db.query(querySql, [...values, id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No Job: ${id}`);
  
      return job;
    }
  
    // Delete from database and replaces with undefined. or throws error
  
    static async remove(id) {
      const result = await db.query(
        `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
        [id]
      );
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No Job: ${id}`);
    }
  }
  
  module.exports = Job;