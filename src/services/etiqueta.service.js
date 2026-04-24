const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { getMissingRequiredFields, hasFields, pickDefinedFields } = require("../utils/payload")
const { generatePublicKey } = require("../utils/security")
const { applyOwnerScope, getOwnedRecordByPublicKey } = require("../utils/reference")

const publicSelect = "key_etiqueta, data_criacao, data_atualizacao, nome, cor"

async function list(auth) {
  let query = supabase.from("etiquetas").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_etiqueta", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return response.data || []
}

async function getByKey(keyEtiqueta, auth) {
  return getOwnedRecordByPublicKey({
    table: "etiquetas",
    keyField: "key_etiqueta",
    publicKey: keyEtiqueta,
    auth,
    select: publicSelect,
    notFoundMessage: "Etiqueta nao encontrada"
  })
}

async function create(payload, auth) {
  const record = pickDefinedFields(payload, ["nome", "cor"])
  const missingFields = getMissingRequiredFields(record, ["nome"])

  if (missingFields.length > 0) {
    throw createAppError(400, `Campos obrigatorios nao informados: ${missingFields.join(", ")}`)
  }

  const response = await supabase
    .from("etiquetas")
    .insert({
      ...record,
      key_etiqueta: generatePublicKey("etiqueta"),
      id_login: auth.idLogin
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return response.data
}

async function update(keyEtiqueta, payload, auth) {
  await getByKey(keyEtiqueta, auth)

  const updates = pickDefinedFields(payload, ["nome", "cor"])

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  updates.data_atualizacao = new Date().toISOString()

  let query = supabase.from("etiquetas").update(updates).select(publicSelect).eq("key_etiqueta", keyEtiqueta)
  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return response.data
}

async function remove(keyEtiqueta, auth) {
  await getByKey(keyEtiqueta, auth)

  let query = supabase.from("etiquetas").delete().select(publicSelect).eq("key_etiqueta", keyEtiqueta)
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
