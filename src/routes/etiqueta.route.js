const express = require("express")

const etiquetaController = require("../controllers/etiqueta.controller")

const router = express.Router()

router.get("/", etiquetaController.list)
router.post("/", etiquetaController.create)
router.get("/:key_etiqueta", etiquetaController.getByKey)
router.put("/:key_etiqueta", etiquetaController.update)
router.delete("/:key_etiqueta", etiquetaController.remove)

module.exports = router
