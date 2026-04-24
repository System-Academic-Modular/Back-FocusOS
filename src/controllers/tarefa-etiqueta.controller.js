const tarefaEtiquetaService = require("../services/tarefa-etiqueta.service")

async function list(req, res) {
  try {
    const data = await tarefaEtiquetaService.list(req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function getByKey(req, res) {
  try {
    const data = await tarefaEtiquetaService.getByKey(
      req.params.key_tarefa,
      req.params.key_etiqueta,
      req.auth
    )

    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function create(req, res) {
  try {
    const data = await tarefaEtiquetaService.create(req.body, req.auth)
    return res.status(201).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function update(req, res) {
  try {
    const data = await tarefaEtiquetaService.update(
      req.params.key_tarefa,
      req.params.key_etiqueta,
      req.body,
      req.auth
    )

    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function remove(req, res) {
  try {
    const data = await tarefaEtiquetaService.remove(
      req.params.key_tarefa,
      req.params.key_etiqueta,
      req.auth
    )

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
