const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { getMissingRequiredFields, hasFields, pickDefinedFields } = require("../utils/payload")
const { generatePublicKey } = require("../utils/security")
const { applyOwnerScope, getOwnedRecordByPublicKey } = require("../utils/reference")

const publicSelect = "key_categoria, data_criacao, data_atualizacao, nome, cor, icone"

async function list(auth) {
  let query = supabase.from("categorias").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_categoria", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return response.data || []
}

async function getByKey(keyCategoria, auth) {
  return getOwnedRecordByPublicKey({
    table: "categorias",
    keyField: "key_categoria",
    publicKey: keyCategoria,
    auth,
    select: publicSelect,
    notFoundMessage: "Categoria nao encontrada"
  })
}

async function create(payload, auth) {
  const record = pickDefinedFields(payload, ["nome", "cor", "icone"])
  const missingFields = getMissingRequiredFields(record, ["nome"])

  if (missingFields.length > 0) {
    throw createAppError(400, `Campos obrigatorios nao informados: ${missingFields.join(", ")}`)
  }

  const response = await supabase
    .from("categorias")
    .insert({
      ...record,
      key_categoria: generatePublicKey("categoria"),
      id_login: auth.idLogin
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return response.data
}

async function update(keyCategoria, payload, auth) {
  await getByKey(keyCategoria, auth)

  const updates = pickDefinedFields(payload, ["nome", "cor", "icone"])

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  updates.data_atualizacao = new Date().toISOString()

  let query = supabase.from("categorias").update(updates).select(publicSelect).eq("key_categoria", keyCategoria)
  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return response.data
}

async function remove(keyCategoria, auth) {
  await getByKey(keyCategoria, auth)

  let query = supabase.from("categorias").delete().select(publicSelect).eq("key_categoria", keyCategoria)
  query = applyOwnerScope(query, auth)

  const response = await query
  handleDatabaseError(response.error)
  return response.data?.[0] || null
}

module.exports = {
  list,
  getByKey,
  create,
  update,
  remove
}
