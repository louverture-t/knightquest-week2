-- Knights Quest Database Schema
-- Module 2: Database Foundations Capstone
-- Theme: King Arthur / Knights of the Round Table

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS quest_assignments;
DROP TABLE IF EXISTS quests;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS realms;

-- ============================================
-- REALMS TABLE
-- The kingdoms/locations where quests take place
-- ============================================
CREATE TABLE realms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ruler VARCHAR(100),
    description TEXT
);

-- ============================================
-- CHARACTERS TABLE
-- Heroes and adventurers that can join quests
-- Foreign key links characters to their home realm
-- ============================================
CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    realm_id INTEGER REFERENCES realms(id)
);

-- ============================================
-- ITEMS TABLE
-- Weapons, potions, and artifacts for quests
-- ============================================
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    power INTEGER
);

-- ============================================
-- QUESTS TABLE
-- Records of created quests
-- Foreign key links quest to its target realm
-- ============================================
CREATE TABLE quests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    realm_id INTEGER REFERENCES realms(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- QUEST_ASSIGNMENTS TABLE
-- Junction table linking quests to characters and items
-- Each row = one character with one item on a quest
-- ============================================
CREATE TABLE quest_assignments (
    id SERIAL PRIMARY KEY,
    quest_id INTEGER REFERENCES quests(id) ON DELETE CASCADE,
    character_id INTEGER REFERENCES characters(id),
    item_id INTEGER REFERENCES items(id)
);

-- Display confirmation
SELECT 'Schema created successfully!' AS status;
