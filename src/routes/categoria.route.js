const express = require("express")

const categoriaController = require("../controllers/categoria.controller")

const router = express.Router()

router.get("/", categoriaController.list)
router.post("/", categoriaController.create)
router.get("/:key_categoria", categoriaController.getByKey)
router.put("/:key_categoria", categoriaController.update)
router.delete("/:key_categoria", categoriaController.remove)

module.exports = router
