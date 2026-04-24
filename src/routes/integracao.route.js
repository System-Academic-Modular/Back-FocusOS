const express = require("express")

const integracaoController = require("../controllers/integracao.controller")

const router = express.Router()

router.get("/", integracaoController.list)
router.post("/", integracaoController.create)
router.get("/:key_integracao", integracaoController.getByKey)
router.put("/:key_integracao", integracaoController.update)
router.delete("/:key_integracao", integracaoController.remove)

module.exports = router
