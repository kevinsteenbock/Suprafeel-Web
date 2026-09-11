// Vuelca los arrays de src/data/*.ts a JSON exacto, para sembrar Xano sin transcripción manual.
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'xano', 'seed')

const products = await import('../src/data/products.ts')
const courses = await import('../src/data/courses.ts')
const plv = await import('../src/data/plv.ts')
const pharmacies = await import('../src/data/pharmacies.ts')
const accounts = await import('../src/data/accounts.ts')
const chat = await import('../src/data/chat.ts')

const SITE = 'https://kevinsteenbock.github.io'
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
dump('pharmacies', pharmacies.pharmacies)
dump('route_today', pharmacies.routeToday)
dump('registry', pharmacies.registry)
dump('accounts', accounts.accounts)
dump('signup_requests', accounts.requests)
dump('reps', accounts.reps)
dump('symptoms', chat.symptoms)
dump('rules', chat.rules)
dump('unanswered', chat.unanswered)
dump('sources', chat.sources)

console.log('\nListo.')
