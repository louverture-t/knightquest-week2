-- Knights Quest Seed Data
-- Theme: King Arthur / Knights of the Round Table

-- ============================================
-- REALMS (5 Kingdoms)
-- ============================================
INSERT INTO realms (name, ruler, description) VALUES
('Camelot', 'King Arthur', 'The legendary castle and court of King Arthur'),
('Avalon', 'Lady of the Lake', 'Mystical island of healing and enchantment'),
('Lyonesse', 'King Meliodas', 'Sunken kingdom off the coast of Cornwall'),
('Orkney', 'King Lot', 'Northern realm of fierce warriors'),
('Corbenic', 'Fisher King', 'Castle of the Holy Grail');

-- ============================================
-- CHARACTERS (12 Knights and Figures)
-- ============================================
-- Camelot Characters (realm_id = 1)
INSERT INTO characters (name, role, realm_id) VALUES
('King Arthur', 'King', 1),
('Sir Lancelot', 'Knight', 1),
('Sir Gawain', 'Knight', 1),
('Merlin', 'Wizard', 1),
('Queen Guinevere', 'Queen', 1);

-- Avalon Characters (realm_id = 2)
INSERT INTO characters (name, role, realm_id) VALUES
('Morgan le Fay', 'Enchantress', 2),
('Lady of the Lake', 'Sorceress', 2);

-- Lyonesse Characters (realm_id = 3)
INSERT INTO characters (name, role, realm_id) VALUES
('Sir Tristan', 'Knight', 3);

-- Orkney Characters (realm_id = 4)
INSERT INTO characters (name, role, realm_id) VALUES
('Sir Mordred', 'Knight', 4),
('Sir Agravain', 'Knight', 4);

-- Corbenic Characters (realm_id = 5)
INSERT INTO characters (name, role, realm_id) VALUES
('Sir Galahad', 'Knight', 5),
('Sir Percival', 'Knight', 5);

-- ============================================
-- ITEMS (10 Legendary Artifacts)
-- ============================================
INSERT INTO items (name, type, power) VALUES
('Excalibur', 'Weapon', 100),
('Excaliburs Scabbard', 'Armor', 80),
('Holy Grail', 'Relic', 150),
('Round Table Shield', 'Armor', 60),
('Merlins Staff', 'Weapon', 90),
('Lancelots Sword', 'Weapon', 85),
('Healing Potion of Avalon', 'Potion', 40),
('Cloak of Invisibility', 'Armor', 70),
('Dragons Bane Spear', 'Weapon', 75),
('Amulet of Protection', 'Relic', 50);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT 'Realms seeded:' AS status, COUNT(*) AS count FROM realms;
SELECT 'Characters seeded:' AS status, COUNT(*) AS count FROM characters;
SELECT 'Items seeded:' AS status, COUNT(*) AS count FROM items;
