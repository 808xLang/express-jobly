'use strict';

/** Routes for Jobs. */

const jsonschema = require('jsonschema');
const express = require('express');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const Job = require('../models/jobs');

const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');

const router = new express.Router();



// POST/ { Job } =>  { Job }
// post {title, salary, equity, companyHandle}
// it should return the same thing
// must be an admin

router.post('/', ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);

    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});



// GET / 
// {jobs:[{ id, title, salary, equity, companyHandle },.....]}
// 
router.get('/', async function (req, res, next) {
  try {
    const jobs = await Job.findAll(req.query);

    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});



// GET /:IDnum
router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});



// PATCH /:ID num {title, salary, equity, companyHandle}
// must be admin

router.patch(
  '/:id',
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  }
);


// DELETE /:ID num

router.delete(
  '/:id',
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;