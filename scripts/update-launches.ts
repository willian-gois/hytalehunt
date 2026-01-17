#!/usr/bin/env ts-node

import { env } from "@/env"
import "dotenv/config"

const DEFAULT_ENDPOINT = "http://localhost:3000/api/cron/update-launches"

const endpoint = process.argv[2] ?? DEFAULT_ENDPOINT
const apiKey = env.CRON_API_KEY

if (!apiKey) {
  console.error(
    "CRON_API_KEY não definido. Configure a variável de ambiente antes de executar o script.",
  )
  process.exit(1)
}

if (!/^https?:\/\//.test(endpoint)) {
  console.error("Informe um endpoint completo (incluindo protocolo http/https).")
  process.exit(1)
}

async function trigger() {
  console.log(`Disparando atualização de lançamentos em: ${endpoint}`)

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")
  const body = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    console.error(`Falha ao executar cron (status ${response.status}).`)
    console.error(body)
    process.exit(1)
  }

  console.log("Cron executado com sucesso:")
  console.log(body)
}

trigger().catch((error) => {
  console.error("Erro inesperado ao executar o cron:")
  console.error(error)
  process.exit(1)
})
