const express = require("express")

const sessaoFocoController = require("../controllers/sessao-foco.controller")

const router = express.Router()

router.get("/", sessaoFocoController.list)
router.post("/", sessaoFocoController.create)
router.get("/:key_sessao_foco", sessaoFocoController.getByKey)
router.put("/:key_sessao_foco", sessaoFocoController.update)
router.delete("/:key_sessao_foco", sessaoFocoController.remove)

module.exports = router
