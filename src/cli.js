#!/usr/bin/env node

// Knights Quest CLI Application
// Module 2: Database Foundations Capstone
// Theme: King Arthur / Knights of the Round Table

import inquirer from 'inquirer';
import * as db from './db.js';
import * as queries from './queries.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Display welcome banner
 */
function showWelcome() {
    console.log('\n');
    console.log('⚔️  ═══════════════════════════════════════════════════════════  ⚔️');
    console.log('                    KNIGHTS QUEST                                  ');
    console.log('              King Arthur\'s Round Table Adventure                 ');
    console.log('⚔️  ═══════════════════════════════════════════════════════════  ⚔️');
    console.log('\n');
}

/**
 * Display quest summary before confirmation
 */
function displayQuestSummary(questTitle, realm, characters, assignments) {
    console.log('\n');
    console.log('📜 ═══════════════════════════════════════════════════════════');
    console.log('                    QUEST SUMMARY                              ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n🏰 Quest: ${questTitle}`);
    console.log(`🗺️  Realm: ${realm.name} (Ruled by ${realm.ruler})`);
    console.log('\n👥 Party Members & Equipment:');
    console.log('───────────────────────────────────────');
    
    assignments.forEach(({ character, items }) => {
        console.log(`\n   🛡️  ${character.name} (${character.role})`);
        items.forEach(item => {
            console.log(`      └─ ${item.name} (${item.type}, Power: ${item.power})`);
        });
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════');
}

/**
 * Display success message after quest creation
 */
function displaySuccess(questId) {
    console.log('\n');
    console.log('🎉 ═══════════════════════════════════════════════════════════');
    console.log('                    QUEST CREATED!                             ');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`\n✅ Your quest has been recorded in the archives!`);
    console.log(`📋 Quest ID: ${questId}`);
    console.log('\n═══════════════════════════════════════════════════════════════');
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

/**
 * Fetch all realms from database
 */
async function fetchRealms() {
    const result = await db.query(queries.listRealms);
    return result.rows;
}

/**
 * Fetch characters for a specific realm
 */
async function fetchCharactersByRealm(realmId) {
    const result = await db.query(queries.charactersByRealm, [realmId]);
    return result.rows;
}

/**
 * Fetch all items from database
 */
async function fetchItems() {
    const result = await db.query(queries.listItems);
    return result.rows;
}

/**
 * Fetch realm details by ID
 */
async function fetchRealmById(realmId) {
    const result = await db.query(queries.getRealmById, [realmId]);
    return result.rows[0];
}

// ============================================
// PROMPT FUNCTIONS
// ============================================

/**
 * Prompt user to select a realm
 */
async function promptRealmSelection(realms) {
    const { realmId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'realmId',
            message: '🏰 Choose a realm for your quest:',
            choices: realms.map(realm => ({
                name: `${realm.name} (Ruler: ${realm.ruler})`,
                value: realm.id
            }))
        }
    ]);
    return realmId;
}

/**
 * Prompt user to select characters (1-3)
 */
async function promptCharacterSelection(characters) {
    const { selectedCharacters } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedCharacters',
            message: '👥 Select your party members (1-3 characters):',
            choices: characters.map(char => ({
                name: `${char.name} (${char.role})`,
                value: char
            })),
            validate: (answer) => {
                if (answer.length === 0) {
                    return '⚠️  You must select at least 1 character!';
                }
                if (answer.length > 3) {
                    return '⚠️  You can only select up to 3 characters!';
                }
                return true;
            }
        }
    ]);
    return selectedCharacters;
}

/**
 * Prompt user to assign items to a specific character
 * Each character must have at least 1 item
 */
async function promptItemAssignment(character, items) {
    const { selectedItems } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedItems',
            message: `⚔️  Assign items to ${character.name} (${character.role}):`,
            choices: items.map(item => ({
                name: `${item.name} - ${item.type} (Power: ${item.power})`,
                value: item
            })),
            validate: (answer) => {
                if (answer.length === 0) {
                    return `⚠️  ${character.name} must have at least 1 item!`;
                }
                return true;
            }
        }
    ]);
    return selectedItems;
}

/**
 * Prompt user for quest title
 */
async function promptQuestTitle() {
    const { title } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: '📜 Enter a title for your quest:',
            validate: (answer) => {
                const trimmed = answer.trim();
                if (trimmed.length === 0) {
                    return '⚠️  Quest title cannot be empty!';
                }
                if (trimmed.length > 150) {
                    return '⚠️  Quest title must be 150 characters or less!';
                }
                return true;
            }
        }
    ]);
    return title.trim();
}

/**
 * Prompt user to confirm quest creation
 */
async function promptConfirmation() {
    const { confirmed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: '✨ Create this quest?',
            default: true
        }
    ]);
    return confirmed;
}

/**
 * Prompt user to create another quest
 */
async function promptCreateAnother() {
    const { another } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'another',
            message: '🔄 Would you like to create another quest?',
            default: true
        }
    ]);
    return another;
}

// ============================================
// DATABASE WRITE FUNCTIONS
// ============================================

/**
 * Save quest and assignments to database using transaction
 */
async function saveQuest(title, realmId, assignments) {
    return await db.transaction(async (client) => {
        // 1. Insert the quest
        const questResult = await client.query(queries.insertQuest, [title, realmId]);
        const quest = questResult.rows[0];
        
        // 2. Insert all assignments
        for (const { character, items } of assignments) {
            for (const item of items) {
                await client.query(queries.insertQuestAssignment, [
                    quest.id,
                    character.id,
                    item.id
                ]);
            }
        }
        
        return quest;
    });
}

// ============================================
// MAIN APPLICATION FLOW
// ============================================

/**
 * Run one complete quest creation flow
 */
async function createQuest() {
    try {
        // Step 1: Select a Realm
        console.log('\n📍 Step 1: Choose Your Realm\n');
        const realms = await fetchRealms();
        const realmId = await promptRealmSelection(realms);
        const realm = await fetchRealmById(realmId);
        
        // Step 2: Select Characters
        console.log('\n📍 Step 2: Assemble Your Party\n');
        const characters = await fetchCharactersByRealm(realmId);
        
        if (characters.length === 0) {
            console.log('⚠️  No characters found in this realm. Please choose another realm.');
            return false;
        }
        
        const selectedCharacters = await promptCharacterSelection(characters);
        
        // Step 3: Assign Items to Characters
        console.log('\n📍 Step 3: Equip Your Party\n');
        const items = await fetchItems();
        const assignments = [];
        
        for (const character of selectedCharacters) {
            const assignedItems = await promptItemAssignment(character, items);
            assignments.push({
                character,
                items: assignedItems
            });
        }
        
        // Step 4: Enter Quest Title
        console.log('\n📍 Step 4: Name Your Quest\n');
        const questTitle = await promptQuestTitle();
        
        // Step 5: Display Summary and Confirm
        displayQuestSummary(questTitle, realm, selectedCharacters, assignments);
        
        const confirmed = await promptConfirmation();
        
        if (!confirmed) {
            console.log('\n❌ Quest creation cancelled.\n');
            return false;
        }
        
        // Step 6: Save to Database
        const quest = await saveQuest(questTitle, realmId, assignments);
        displaySuccess(quest.id);
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Error creating quest:', error.message);
        return false;
    }
}

/**
 * Main application entry point
 */
async function main() {
    showWelcome();
    
    let continueCreating = true;
    
    while (continueCreating) {
        await createQuest();
        continueCreating = await promptCreateAnother();
    }
    
    // Goodbye message
    console.log('\n');
    console.log('⚔️  ═══════════════════════════════════════════════════════════  ⚔️');
    console.log('                    FAREWELL, NOBLE KNIGHT!                       ');
    console.log('              May your quests bring glory to the realm!           ');
    console.log('⚔️  ═══════════════════════════════════════════════════════════  ⚔️');
    console.log('\n');
    
    // Close database connection
    await db.close();
    process.exit(0);
}

// Run the application
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
