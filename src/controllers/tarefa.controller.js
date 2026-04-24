const tarefaService = require("../services/tarefa.service")

async function list(req, res) {
  try {
    const data = await tarefaService.list(req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function getByKey(req, res) {
  try {
    const data = await tarefaService.getByKey(req.params.key_tarefa, req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function create(req, res) {
  try {
    const data = await tarefaService.create(req.body, req.auth)
    return res.status(201).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function update(req, res) {
  try {
    const data = await tarefaService.update(req.params.key_tarefa, req.body, req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function remove(req, res) {
  try {
    const data = await tarefaService.remove(req.params.key_tarefa, req.auth)
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
