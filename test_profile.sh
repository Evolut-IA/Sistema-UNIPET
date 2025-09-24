#!/bin/bash
echo "Testing client profile data display"

# Test direct API call to check if data mapping is correct
echo "Creating test client in database..."
psql $DATABASE_URL -c "INSERT INTO clients (id, full_name, email, phone, cpf, cep, address, password, created_at, updated_at) VALUES ('test-client-direct', 'Maria Silva', 'maria.test@gmail.com', '(11) 99999-8888', '98765432100', '04567-890', 'Rua das Flores, 456', '$2a$12$Zpt151M1BW2HfhT3pzZvj.EaGIY6FlX3zUtlOr2y1ZAuEVgfCIDki', NOW(), NOW()) ON CONFLICT (id) DO UPDATE SET full_name=EXCLUDED.full_name, email=EXCLUDED.email;"

echo "Testing client exists in database:"
psql $DATABASE_URL -c "SELECT id, full_name, email, phone, cpf, cep FROM clients WHERE id='test-client-direct';"


