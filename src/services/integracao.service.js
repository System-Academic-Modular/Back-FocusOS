const { supabase } = require("../config/supabase")
const { createAppError } = require("../utils/app-error")
const { handleDatabaseError } = require("../utils/database")
const { hasFields, pickDefinedFields } = require("../utils/payload")
const { generatePublicKey } = require("../utils/security")
const { applyOwnerScope, getOwnedRecordByPublicKey } = require("../utils/reference")

const publicSelect = [
  "key_integracao",
  "data_criacao",
  "data_atualizacao",
  "provedor",
  "access_token",
  "refresh_token",
  "expires_at",
  "calendar_id"
].join(", ")

async function list(auth) {
  let query = supabase.from("integracoes").select(publicSelect)
  query = applyOwnerScope(query, auth).order("id_integracao", { ascending: true })

  const response = await query
  handleDatabaseError(response.error)
  return response.data || []
}

async function getByKey(keyIntegracao, auth) {
  return getOwnedRecordByPublicKey({
    table: "integracoes",
    keyField: "key_integracao",
    publicKey: keyIntegracao,
    auth,
    select: publicSelect,
    notFoundMessage: "Integracao nao encontrada"
  })
}

async function create(payload, auth) {
  const record = pickDefinedFields(payload, [
    "provedor",
    "access_token",
    "refresh_token",
    "expires_at",
    "calendar_id"
  ])

  const response = await supabase
    .from("integracoes")
    .insert({
      ...record,
      key_integracao: generatePublicKey("integracao"),
      id_login: auth.idLogin
    })
    .select(publicSelect)
    .single()

  handleDatabaseError(response.error)
  return response.data
}

async function update(keyIntegracao, payload, auth) {
  await getByKey(keyIntegracao, auth)

  const updates = pickDefinedFields(payload, [
    "provedor",
    "access_token",
    "refresh_token",
    "expires_at",
    "calendar_id"
  ])

  if (!hasFields(updates)) {
    throw createAppError(400, "Nenhum campo valido foi informado para atualizacao")
  }

  updates.data_atualizacao = new Date().toISOString()

  let query = supabase
    .from("integracoes")
    .update(updates)
    .select(publicSelect)
    .eq("key_integracao", keyIntegracao)

  query = applyOwnerScope(query, auth)

  const response = await query.single()
  handleDatabaseError(response.error)
  return response.data
}

async function remove(keyIntegracao, auth) {
  await getByKey(keyIntegracao, auth)

  let query = supabase
    .from("integracoes")
    .delete()
    .select(publicSelect)
    .eq("key_integracao", keyIntegracao)

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
