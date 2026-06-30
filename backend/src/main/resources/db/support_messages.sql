CREATE TABLE IF NOT EXISTS support_conversations (
    conversation_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    employee_id BIGINT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    last_message TEXT,
    last_message_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_conv_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_support_conv_employee FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS support_messages (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    read_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_support_msg_conversation FOREIGN KEY (conversation_id) REFERENCES support_conversations(conversation_id)
);
