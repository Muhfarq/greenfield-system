const bcrypt = require('bcryptjs');
const pool = require('./config/db');
require('dotenv').config();

async function seed() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const operatorHash = await bcrypt.hash('operator123', 10);

  await pool.query(`
    INSERT INTO users (name, email, password_hash, role)
    VALUES 
      ('Admin Greenfield', 'admin@greenfield.com', $1, 'admin'),
      ('Operator Satu', 'operator@greenfield.com', $2, 'operator')
    ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash
  `, [adminHash, operatorHash]);

  console.log('Seed berhasil!');
  console.log('Admin    → admin@greenfield.com / admin123');
  console.log('Operator → operator@greenfield.com / operator123');
}

seed()
  .catch(err => {
    console.error('Seed gagal:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end()); 