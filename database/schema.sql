-- Suppression des tables existantes (pour développement)
DROP TABLE IF EXISTS waste_declarations CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS invitations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS waste_providers CASCADE;
DROP TABLE IF EXISTS waste_types CASCADE;

-- Table des types de déchets (7 flux AGEC)
CREATE TABLE waste_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#1C7C54',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prestataires de collecte
CREATE TABLE waste_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    siret VARCHAR(14),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des entreprises
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    siret VARCHAR(14) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#1C7C54',
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    subscription_expires_at DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'member', -- admin, member
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des invitations
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by INTEGER REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des déclarations de déchets
CREATE TABLE waste_declarations (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    waste_type_id INTEGER REFERENCES waste_types(id),
    provider_id INTEGER REFERENCES waste_providers(id),
    quantity_kg DECIMAL(10,2) NOT NULL,
    is_recycled BOOLEAN DEFAULT true,
    cost DECIMAL(10,2),
    declaration_date DATE NOT NULL,
    site_name VARCHAR(200),
    comments TEXT,
    proof_url VARCHAR(500),
    proof_type VARCHAR(50), -- bon_pesee, photo, facture
    status VARCHAR(50) DEFAULT 'declared', -- declared, validated, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des rapports générés
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    generated_by INTEGER REFERENCES users(id),
    report_type VARCHAR(50) NOT NULL, -- monthly, annual, custom
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    file_url VARCHAR(500),
    total_weight_kg DECIMAL(12,2),
    recycling_rate DECIMAL(5,2),
    total_cost DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_declarations_company_date ON waste_declarations(company_id, declaration_date);
CREATE INDEX idx_declarations_type ON waste_declarations(waste_type_id);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_reports_company_period ON reports(company_id, period_start, period_end);

-- Insertion des données initiales pour les 7 flux AGEC
INSERT INTO waste_types (code, name, color, icon) VALUES
('PAPER_CARDBOARD', 'Papier / Carton', '#2563eb', 'file-text'),
('PLASTIC', 'Plastique', '#ef4444', 'package'),
('GLASS', 'Verre', '#10b981', 'wine'),
('WOOD', 'Bois', '#92400e', 'trees'),
('METAL', 'Métal', '#6b7280', 'wrench'),
('PLASTER', 'Plâtre', '#f59e0b', 'square'),
('INERT', 'Déchets inertes', '#8b5cf6', 'mountain');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_declarations_updated_at BEFORE UPDATE ON waste_declarations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waste_providers_updated_at BEFORE UPDATE ON waste_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vue pour les statistiques mensuelles
CREATE VIEW monthly_stats AS
SELECT 
    wd.company_id,
    DATE_TRUNC('month', wd.declaration_date) as month,
    SUM(wd.quantity_kg) as total_kg,
    SUM(CASE WHEN wd.is_recycled THEN wd.quantity_kg ELSE 0 END) as recycled_kg,
    CASE 
        WHEN SUM(wd.quantity_kg) > 0 
        THEN ROUND((SUM(CASE WHEN wd.is_recycled THEN wd.quantity_kg ELSE 0 END) / SUM(wd.quantity_kg)) * 100, 2)
        ELSE 0 
    END as recycling_rate,
    SUM(wd.cost) as total_cost,
    COUNT(DISTINCT wd.id) as declaration_count
FROM waste_declarations wd
WHERE wd.status = 'declared'
GROUP BY wd.company_id, DATE_TRUNC('month', wd.declaration_date);

-- Vue pour la répartition par type de déchet
CREATE VIEW waste_distribution AS
SELECT 
    wd.company_id,
    DATE_TRUNC('month', wd.declaration_date) as month,
    wt.name as waste_type,
    wt.color,
    SUM(wd.quantity_kg) as total_kg,
    ROUND(SUM(wd.quantity_kg) * 100.0 / SUM(SUM(wd.quantity_kg)) OVER (PARTITION BY wd.company_id, DATE_TRUNC('month', wd.declaration_date)), 2) as percentage
FROM waste_declarations wd
JOIN waste_types wt ON wd.waste_type_id = wt.id
WHERE wd.status = 'declared'
GROUP BY wd.company_id, DATE_TRUNC('month', wd.declaration_date), wt.name, wt.color;