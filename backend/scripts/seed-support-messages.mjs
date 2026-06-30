import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const url = env.SPRING_DATASOURCE_URL || '';
const match = url.match(/\/\/([^:]+):(\d+)\/([^?]+)/);
const config = {
  host: match?.[1],
  port: Number(match?.[2]),
  user: env.SPRING_DATASOURCE_USERNAME,
  password: env.SPRING_DATASOURCE_PASSWORD,
  database: match?.[3],
  ssl: { rejectUnauthorized: false },
};

const conn = await mysql.createConnection(config);
const now = new Date();

const [customers] = await conn.query(
  `SELECT customer_id, full_name, phone_number FROM customers
   WHERE customer_id IN (2, 6, 9, 10) ORDER BY customer_id`
);
const [employees] = await conn.query(
  `SELECT id, full_name, email FROM employees WHERE is_active = 1
   AND (full_name LIKE '%Toàn%' OR full_name LIKE '%toàn%' OR id <= 3)
   ORDER BY id`
);

console.log('=== Khách hàng dùng cho test ===');
console.table(customers);
console.log('=== Nhân viên ===');
console.table(employees);

if (!customers.length) {
  console.error('Không có khách hàng — không thể seed.');
  await conn.end();
  process.exit(1);
}

const toanDuong = employees.find((e) => e.full_name?.includes('Toàn')) || employees[0];
const otherEmployee = employees.find((e) => e.id !== toanDuong?.id) || employees[1];

const scenarios = [
  {
    customerId: customers[0].customer_id,
    subject: '[TEST] Chờ nhận — Hỏi đơn hàng iPhone 15',
    status: 'OPEN',
    employeeId: null,
    messages: [
      { type: 'CUSTOMER', content: 'Xin chào shop, tôi đặt iPhone 15 hôm qua, khi nào giao ạ?' },
      { type: 'CUSTOMER', content: 'Mã đơn #12345, vui lòng kiểm tra giúp em.' },
    ],
    hint: 'OPEN — nhân viên bất kỳ có thể bấm Nhận xử lý',
  },
  {
    customerId: customers[1]?.customer_id || customers[0].customer_id,
    subject: '[TEST] Chờ nhận — Hỏi giá Samsung S24',
    status: 'OPEN',
    employeeId: null,
    messages: [
      { type: 'CUSTOMER', content: 'Shop cho em hỏi Samsung S24 Ultra giá bao nhiêu?' },
      { type: 'CUSTOMER', content: 'Có trả góp 0% không ạ?' },
    ],
    hint: 'OPEN — tin thứ 2 để test tranh nhận',
  },
  {
    customerId: customers[0].customer_id,
    subject: '[TEST] Toàn Dương đang xử lý — Đổi màu máy',
    status: 'ASSIGNED',
    employeeId: toanDuong?.id,
    messages: [
      { type: 'CUSTOMER', content: 'Em muốn đổi từ màu đen sang trắng được không?' },
      ...(toanDuong
        ? [{ type: 'EMPLOYEE', senderId: toanDuong.id, content: 'Dạ được ạ, bạn gửi mã đơn để em kiểm tra nhé.' }]
        : []),
    ],
    hint: `ASSIGNED — chỉ ${toanDuong?.full_name || 'NV'} trả lời được`,
  },
  {
    customerId: customers[2]?.customer_id || customers[0].customer_id,
    subject: '[TEST] NV khác đã nhận — Bảo hành màn hình',
    status: 'ASSIGNED',
    employeeId: otherEmployee?.id,
    messages: [
      { type: 'CUSTOMER', content: 'Màn hình máy em bị ám vàng, còn bảo hành không?' },
      ...(otherEmployee
        ? [{ type: 'EMPLOYEE', senderId: otherEmployee.id, content: 'Bạn mang máy qua cửa hàng để kỹ thuật kiểm tra nhé.' }]
        : []),
    ],
    hint: `ASSIGNED — ${otherEmployee?.full_name || 'NV khác'} đã nhận, Toàn Dương không nhận lại được`,
  },
  {
    customerId: customers[3]?.customer_id || customers[0].customer_id,
    subject: '[TEST] Đã trả lời — Hỏi địa chỉ cửa hàng',
    status: 'RESOLVED',
    employeeId: toanDuong?.id,
    messages: [
      { type: 'CUSTOMER', content: 'Cho em xin địa chỉ cửa hàng gần quận 1 ạ?' },
      ...(toanDuong
        ? [{ type: 'EMPLOYEE', senderId: toanDuong.id, content: 'Dạ cửa hàng ở 123 Nguyễn Huệ, Q1, mở 8h–21h ạ.' }]
        : []),
    ],
    hint: 'RESOLVED — đã có phản hồi',
  },
];

console.log('\nĐang chèn dữ liệu test...\n');

for (const s of scenarios) {
  const lastMsg = s.messages[s.messages.length - 1].content;
  const [conv] = await conn.query(
    `INSERT INTO support_conversations
     (customer_id, employee_id, subject, status, last_message, last_message_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.customerId, s.employeeId, s.subject, s.status, lastMsg, now, now, now]
  );

  for (const m of s.messages) {
    const senderId = m.senderId ?? s.customerId;
    await conn.query(
      `INSERT INTO support_messages (conversation_id, sender_type, sender_id, content, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [conv.insertId, m.type, senderId, m.content, now]
    );
  }
  console.log(`✓ #${conv.insertId} ${s.status.padEnd(8)} | ${s.subject}`);
  console.log(`  → ${s.hint}`);
}

const [summary] = await conn.query(
  `SELECT c.conversation_id, c.subject, c.status,
          cu.full_name AS khach_hang,
          COALESCE(e.full_name, '—') AS nhan_vien,
          (SELECT COUNT(*) FROM support_messages m WHERE m.conversation_id = c.conversation_id) AS so_tin
   FROM support_conversations c
   JOIN customers cu ON cu.customer_id = c.customer_id
   LEFT JOIN employees e ON e.id = c.employee_id
   WHERE c.subject LIKE '[TEST]%'
   ORDER BY c.conversation_id DESC
   LIMIT 10`
);

console.log('\n=== 10 cuộc hội thoại test mới nhất ===');
console.table(summary);

await conn.end();

console.log(`
Xem trên giao diện:
  • Admin:     http://localhost:3000/admin/messages
  • Khách:     http://localhost:3000/user/profile/support (SĐT 0982481099)

Test nhân viên tự nhận:
  1. Đăng nhập Toàn Dương (toandtde180017@fpt.edu.vn)
  2. Vào /admin/messages → chọn tin "Chờ nhận" → Nhận xử lý → trả lời
  3. Đăng nhập NV khác → tin đã nhận sẽ không còn trong hàng chờ
`);
