const sessaoFocoService = require("../services/sessao-foco.service")

async function list(req, res) {
  try {
    const data = await sessaoFocoService.list(req.auth)
    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function getByKey(req, res) {
  try {
    const data = await sessaoFocoService.getByKey(
      req.params.key_sessao_foco,
      req.auth
    )

    return res.status(200).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function create(req, res) {
  try {
    const data = await sessaoFocoService.create(req.body, req.auth)
    return res.status(201).json({ data })
  } catch (error) {
    return res.status(error.statusCode || 400).json({ error: error.message })
  }
}

async function update(req, res) {
  try {
    const data = await sessaoFocoService.update(
      req.params.key_sessao_foco,
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
    const data = await sessaoFocoService.remove(
      req.params.key_sessao_foco,
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
