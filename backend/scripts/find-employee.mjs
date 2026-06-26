import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'mysql-2646241a-myloc203-df70.e.aivencloud.com',
  port: 24714,
  user: 'avnadmin',
  password: 'AVNS_HNcbA_yh7QK4UPUikiH',
  database: 'phoneShop',
  ssl: { rejectUnauthorized: false },
});

const [rows] = await conn.query(
  `SELECT id, full_name, email, is_active FROM employees
   WHERE full_name LIKE '%Toan%' OR full_name LIKE '%Duong%' OR full_name LIKE '%toan%' OR full_name LIKE '%duong%'
   ORDER BY id`
);
console.log('=== Match Toan/Duong ===');
console.table(rows);

const [all] = await conn.query(
  'SELECT id, full_name, email FROM employees WHERE is_active = 1 ORDER BY id'
);
console.log('=== All active employees ===');
console.table(all);

const [convs] = await conn.query(
  `SELECT conversation_id, subject, status, employee_id FROM support_conversations WHERE subject LIKE '[TEST]%'`
);
console.log('=== Test conversations ===');
console.table(convs);

await conn.end();
