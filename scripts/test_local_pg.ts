import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres'
  });
  try {
    await client.connect();
    console.log('Connected to local postgres!');
    const res = await client.query('SELECT current_database()');
    console.log('DB:', res.rows);
    await client.end();
  } catch (err: any) {
    console.error('Local pg connection error:', err.message);
  }
}

run().catch(console.error);
