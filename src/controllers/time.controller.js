const timeService = require("../services/time.service")

async function list(req, res) {
  try {
    const data = await timeService.list(req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function getByKey(req, res) {
  try {
    const data = await timeService.getByKey(req.params.key_time, req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function create(req, res) {
  try {
    const data = await timeService.create(req.body, req.auth)
    return res.status(201).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function update(req, res) {
  try {
    const data = await timeService.update(req.params.key_time, req.body, req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function remove(req, res) {
  try {
    const data = await timeService.remove(req.params.key_time, req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
