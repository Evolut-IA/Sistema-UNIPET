const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { plans } = require('./shared/schema.ts');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/unipet';
const sql = postgres(databaseUrl, { ssl: { rejectUnauthorized: false } });
const db = drizzle(sql, { schema: { plans } });

async function getPlans() {
  try {
    const result = await db.select().from(plans);
    console.log('Planos encontrados:');
    result.forEach(plan => {
      console.log(`ID: ${plan.id}, Nome: ${plan.name}`);
    });
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await sql.end();
  }
}

getPlans();
