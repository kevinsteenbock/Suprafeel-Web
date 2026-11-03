// Vuelca los arrays de contenido de src/data/*.ts a JSON exacto, para sembrar Xano sin transcripción manual.
// Farmacias, cuentas y comerciales ya no salen de aquí: viven solo en Xano (tabla sf_farmacia y
// GET /farmacias, GET y POST /admin/usuarios). Los JSON antiguos de xano/seed/ con esos nombres
// (pharmacies, route_today, registry, accounts, signup_requests, reps) son de la demo y no se regeneran.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'xano', 'seed')

const products = await import('../src/data/products.ts')
const courses = await import('../src/data/courses.ts')
const plv = await import('../src/data/plv.ts')
const chat = await import('../src/data/chat.ts')

const SITE = 'https://suprafeel-profesional.com'
const absolutize = (data) => {
  for (const item of Array.isArray(data) ? data : [data]) {
    if (item && typeof item === 'object' && typeof item.cover === 'string' && item.cover.startsWith('/')) {
      item.cover = SITE + item.cover
    }
  }
  return data
}

const dump = (name, data) => {
  data = absolutize(data)
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(data, null, 2) + '\n')
  console.log(`✓ ${name}.json (${Array.isArray(data) ? data.length : Object.keys(data).length} items)`)
}

dump('products', products.products)
dump('categories', products.categories)
dump('courses', courses.courses)
dump('campaigns', plv.campaigns)
dump('materials', plv.materials)
dump('symptoms', chat.symptoms)
dump('rules', chat.rules)
dump('unanswered', chat.unanswered)
dump('sources', chat.sources)

console.log('\nListo.')
