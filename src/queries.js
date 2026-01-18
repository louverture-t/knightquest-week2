// SQL Query Templates
// Knights Quest - Module 2 Capstone

// ============================================
// READ QUERIES (SELECT)
// ============================================

/**
 * Get all realms for selection menu
 */
export const listRealms = `
    SELECT id, name, ruler 
    FROM realms 
    ORDER BY name
`;

/**
 * Get characters belonging to a specific realm
 * @param $1 - realm_id
 */
export const charactersByRealm = `
    SELECT id, name, role 
    FROM characters 
    WHERE realm_id = $1 
    ORDER BY name
`;

/**
 * Get all items for selection
 */
export const listItems = `
    SELECT id, name, type, power 
    FROM items 
    ORDER BY type, name
`;

/**
 * Get a single realm by ID (for confirmation display)
 * @param $1 - realm_id
 */
export const getRealmById = `
    SELECT id, name, ruler, description 
    FROM realms 
    WHERE id = $1
`;

/**
 * Get character details by ID
 * @param $1 - character_id
 */
export const getCharacterById = `
    SELECT c.id, c.name, c.role, r.name AS realm_name 
    FROM characters c
    JOIN realms r ON c.realm_id = r.id
    WHERE c.id = $1
`;

/**
 * Get item details by ID
 * @param $1 - item_id
 */
export const getItemById = `
    SELECT id, name, type, power 
    FROM items 
    WHERE id = $1
`;

// ============================================
// WRITE QUERIES (INSERT)
// ============================================

/**
 * Create a new quest
 * @param $1 - title
 * @param $2 - realm_id
 * @returns The created quest row
 */
export const insertQuest = `
    INSERT INTO quests (title, realm_id) 
    VALUES ($1, $2) 
    RETURNING id, title, realm_id, created_at
`;

/**
 * Create a quest assignment (character + item on a quest)
 * @param $1 - quest_id
 * @param $2 - character_id
 * @param $3 - item_id
 */
export const insertQuestAssignment = `
    INSERT INTO quest_assignments (quest_id, character_id, item_id) 
    VALUES ($1, $2, $3) 
    RETURNING id
`;

// ============================================
// VERIFICATION QUERIES (for testing)
// ============================================

/**
 * Get quest with realm info
 * @param $1 - quest_id
 */
export const getQuestDetails = `
    SELECT q.*, r.name AS realm_name 
    FROM quests q 
    JOIN realms r ON q.realm_id = r.id 
    WHERE q.id = $1
`;

/**
 * Get all assignments for a quest with character and item names
 * @param $1 - quest_id
 */
export const getQuestAssignments = `
    SELECT 
        qa.id,
        c.name AS character_name,
        c.role AS character_role,
        i.name AS item_name,
        i.type AS item_type,
        i.power AS item_power
    FROM quest_assignments qa
    JOIN characters c ON qa.character_id = c.id
    JOIN items i ON qa.item_id = i.id
    WHERE qa.quest_id = $1
    ORDER BY c.name
`;

/**
 * Count total quests (for stats)
 */
export const countQuests = `
    SELECT COUNT(*) AS total FROM quests
`;
