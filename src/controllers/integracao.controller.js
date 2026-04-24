const integracaoService = require("../services/integracao.service")

async function list(req, res) {
  try {
    const data = await integracaoService.list(req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function getByKey(req, res) {
  try {
    const data = await integracaoService.getByKey(req.params.key_integracao, req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function create(req, res) {
  try {
    const data = await integracaoService.create(req.body, req.auth)
    return res.status(201).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function update(req, res) {
  try {
    const data = await integracaoService.update(
      req.params.key_integracao,
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
    const data = await integracaoService.remove(req.params.key_integracao, req.auth)
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
