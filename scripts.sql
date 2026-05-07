-- Ymmo database migration script
-- Safe to run on MySQL 8+ (idempotent for table creation)

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    client_id INTEGER NOT NULL,
    property_id INTEGER NULL,
    agent_id INTEGER NULL,
    agency_id INTEGER NULL,
    transaction_type VARCHAR(20) DEFAULT 'purchase',
    status VARCHAR(50) DEFAULT 'new',
    budget DECIMAL(15,2) NULL,
    notes VARCHAR(1000) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_transactions_client_id (client_id),
    INDEX idx_transactions_property_id (property_id),
    INDEX idx_transactions_agent_id (agent_id),
    INDEX idx_transactions_agency_id (agency_id),
    CONSTRAINT fk_transactions_client_id FOREIGN KEY (client_id) REFERENCES users(id),
    CONSTRAINT fk_transactions_property_id FOREIGN KEY (property_id) REFERENCES properties(property_id),
    CONSTRAINT fk_transactions_agent_id FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
    CONSTRAINT fk_transactions_agency_id FOREIGN KEY (agency_id) REFERENCES agencies(agency_id)
);

-- Optional normalization for properties if your DB was created before these columns existed.
ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS surface INTEGER DEFAULT 45,
    ADD COLUMN IF NOT EXISTS property_type VARCHAR(50) DEFAULT 'apartment',
    ADD COLUMN IF NOT EXISTS photo_url VARCHAR(1000) DEFAULT '',
    ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
