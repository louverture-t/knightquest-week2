#!/usr/bin/env node

// Knights Quest CLI Application
// Module 2: Database Foundations Capstone
// Theme: King Arthur / Knights of the Round Table

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
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
    console.log(chalk.yellow('⚔️  ═══════════════════════════════════════════════════════════  ⚔️'));
    console.log(chalk.bold.cyan('                    KNIGHTS QUEST                                  '));
    console.log(chalk.cyan('              King Arthur\'s Round Table Adventure                 '));
    console.log(chalk.yellow('⚔️  ═══════════════════════════════════════════════════════════  ⚔️'));
    console.log('\n');
}

/**
 * Display quest summary before confirmation
 */
function displayQuestSummary(questTitle, realm, characters, assignments) {
    console.log('\n');
    console.log(chalk.magenta('📜 ═══════════════════════════════════════════════════════════'));
    console.log(chalk.bold.magenta('                    QUEST SUMMARY                              '));
    console.log(chalk.magenta('═══════════════════════════════════════════════════════════════'));
    console.log(`\n🏰 Quest: ${chalk.bold.white(questTitle)}`);
    console.log(`🗺️  Realm: ${chalk.cyan(realm.name)} (Ruled by ${chalk.yellow(realm.ruler)})`);
    console.log('\n👥 Party Members & Equipment:');
    console.log(chalk.gray('───────────────────────────────────────'));
    
    assignments.forEach(({ character, items }) => {
        console.log(`\n   🛡️  ${chalk.bold.green(character.name)} (${chalk.italic(character.role)})`);
        items.forEach(item => {
            console.log(chalk.gray(`      └─ `) + `${chalk.white(item.name)} (${item.type}, Power: ${chalk.yellow(item.power)})`);
        });
    });
    
    console.log('\n' + chalk.magenta('═══════════════════════════════════════════════════════════════'));
}

/**
 * Display success message after quest creation
 */
function displaySuccess(questId) {
    console.log('\n');
    console.log(chalk.green('🎉 ═══════════════════════════════════════════════════════════'));
    console.log(chalk.bold.green('                    QUEST CREATED!                             '));
    console.log(chalk.green('═══════════════════════════════════════════════════════════════'));
    console.log(`\n${chalk.green('✅')} Your quest has been recorded in the archives!`);
    console.log(`📋 Quest ID: ${chalk.bold.cyan(questId)}`);
    console.log('\n' + chalk.green('═══════════════════════════════════════════════════════════════'));
}

/**
 * Display error message with formatting
 */
function displayError(title, message, hint = null) {
    console.log('\n');
    console.log(chalk.red('❌ ═══════════════════════════════════════════════════════════'));
    console.log(chalk.bold.red(`                    ${title}`));
    console.log(chalk.red('═══════════════════════════════════════════════════════════════'));
    console.log(`\n${chalk.red('Error:')} ${message}`);
    if (hint) {
        console.log(chalk.yellow(`\n💡 Hint: ${hint}`));
    }
    console.log('\n' + chalk.red('═══════════════════════════════════════════════════════════════'));
}

/**
 * Check database connection at startup
 */
async function checkDatabaseConnection() {
    const spinner = ora({
        text: 'Connecting to database...',
        color: 'cyan'
    }).start();

    try {
        await db.testConnection();
        spinner.succeed(chalk.green('Connected to PostgreSQL database'));
        return true;
    } catch (error) {
        spinner.fail(chalk.red('Cannot connect to database'));
        
        // Provide specific error messages based on error type
        if (error.code === 'ECONNREFUSED') {
            displayError(
                'CONNECTION REFUSED',
                'PostgreSQL server is not running or not reachable.',
                'Make sure PostgreSQL is running and check your DB_HOST and DB_PORT in .env'
            );
        } else if (error.code === '28P01' || error.code === '28000') {
            displayError(
                'AUTHENTICATION FAILED',
                'Invalid database username or password.',
                'Check your DB_USER and DB_PASSWORD in .env'
            );
        } else if (error.code === '3D000') {
            displayError(
                'DATABASE NOT FOUND',
                `Database "${process.env.DB_NAME || 'unknown'}" does not exist.`,
                'Run "npm run db:create" to create the database, then "npm run db:reset" to set up tables'
            );
        } else {
            displayError(
                'DATABASE ERROR',
                error.message,
                'Check your .env file configuration'
            );
        }
        return false;
    }
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

/**
 * Fetch all realms from database
 */
async function fetchRealms() {
    const spinner = ora({
        text: 'Loading realms...',
        color: 'cyan'
    }).start();

    try {
        const result = await db.query(queries.listRealms);
        
        if (result.rows.length === 0) {
            spinner.warn(chalk.yellow('No realms found in database'));
            return [];
        }
        
        spinner.succeed(chalk.green(`Loaded ${result.rows.length} realm(s)`));
        return result.rows;
    } catch (error) {
        spinner.fail(chalk.red('Failed to load realms'));
        throw error;
    }
}

/**
 * Fetch characters for a specific realm
 */
async function fetchCharactersByRealm(realmId) {
    const spinner = ora({
        text: 'Loading characters...',
        color: 'cyan'
    }).start();

    try {
        const result = await db.query(queries.charactersByRealm, [realmId]);
        
        if (result.rows.length === 0) {
            spinner.warn(chalk.yellow('No characters found in this realm'));
            return [];
        }
        
        spinner.succeed(chalk.green(`Loaded ${result.rows.length} character(s)`));
        return result.rows;
    } catch (error) {
        spinner.fail(chalk.red('Failed to load characters'));
        throw error;
    }
}

/**
 * Fetch all items from database
 */
async function fetchItems() {
    const spinner = ora({
        text: 'Loading items...',
        color: 'cyan'
    }).start();

    try {
        const result = await db.query(queries.listItems);
        
        if (result.rows.length === 0) {
            spinner.warn(chalk.yellow('No items found in database'));
            return [];
        }
        
        spinner.succeed(chalk.green(`Loaded ${result.rows.length} item(s)`));
        return result.rows;
    } catch (error) {
        spinner.fail(chalk.red('Failed to load items'));
        throw error;
    }
}

/**
 * Fetch realm details by ID
 */
async function fetchRealmById(realmId) {
    try {
        const result = await db.query(queries.getRealmById, [realmId]);
        
        if (!result.rows[0]) {
            throw new Error(`Realm with ID ${realmId} not found`);
        }
        
        return result.rows[0];
    } catch (error) {
        throw error;
    }
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
    const spinner = ora({
        text: 'Saving quest to the archives...',
        color: 'cyan'
    }).start();

    try {
        const quest = await db.transaction(async (client) => {
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
        
        spinner.succeed(chalk.green('Quest saved successfully!'));
        return quest;
    } catch (error) {
        spinner.fail(chalk.red('Failed to save quest'));
        throw error;
    }
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
        console.log(chalk.cyan('\n📍 Step 1: Choose Your Realm\n'));
        const realms = await fetchRealms();
        
        // Handle empty realms
        if (realms.length === 0) {
            displayError(
                'NO REALMS AVAILABLE',
                'There are no realms in the database.',
                'Run "npm run db:seed" to populate the database with sample data'
            );
            return false;
        }
        
        const realmId = await promptRealmSelection(realms);
        const realm = await fetchRealmById(realmId);
        
        // Step 2: Select Characters
        console.log(chalk.cyan('\n📍 Step 2: Assemble Your Party\n'));
        const characters = await fetchCharactersByRealm(realmId);
        
        if (characters.length === 0) {
            console.log(chalk.yellow('\n⚠️  No characters found in this realm. Please choose another realm.\n'));
            return false;
        }
        
        const selectedCharacters = await promptCharacterSelection(characters);
        
        // Step 3: Assign Items to Characters
        console.log(chalk.cyan('\n📍 Step 3: Equip Your Party\n'));
        const items = await fetchItems();
        
        // Handle empty items
        if (items.length === 0) {
            displayError(
                'NO ITEMS AVAILABLE',
                'There are no items in the database.',
                'Run "npm run db:seed" to populate the database with sample data'
            );
            return false;
        }
        
        const assignments = [];
        
        for (const character of selectedCharacters) {
            const assignedItems = await promptItemAssignment(character, items);
            assignments.push({
                character,
                items: assignedItems
            });
        }
        
        // Step 4: Enter Quest Title
        console.log(chalk.cyan('\n📍 Step 4: Name Your Quest\n'));
        const questTitle = await promptQuestTitle();
        
        // Step 5: Display Summary and Confirm
        displayQuestSummary(questTitle, realm, selectedCharacters, assignments);
        
        const confirmed = await promptConfirmation();
        
        if (!confirmed) {
            console.log(chalk.yellow('\n❌ Quest creation cancelled.\n'));
            return false;
        }
        
        // Step 6: Save to Database
        const quest = await saveQuest(questTitle, realmId, assignments);
        displaySuccess(quest.id);
        
        return true;
        
    } catch (error) {
        // Handle user cancellation (Ctrl+C during prompts)
        if (error.name === 'ExitPromptError') {
            console.log(chalk.yellow('\n\n⚔️  Quest creation interrupted. Farewell!\n'));
            await db.close();
            process.exit(0);
        }
        
        // Handle database connection errors during the flow
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            displayError(
                'CONNECTION LOST',
                'Lost connection to the database during quest creation.',
                'Check if PostgreSQL is still running and try again'
            );
        } else {
            displayError(
                'QUEST CREATION FAILED',
                error.message,
                'Please try again. If the problem persists, check the database connection.'
            );
        }
        return false;
    }
}

/**
 * Main application entry point
 */
async function main() {
    showWelcome();
    
    // Check database connection before proceeding
    const connected = await checkDatabaseConnection();
    if (!connected) {
        process.exit(1);
    }
    
    let continueCreating = true;
    
    while (continueCreating) {
        await createQuest();
        
        try {
            continueCreating = await promptCreateAnother();
        } catch (error) {
            // Handle Ctrl+C during "create another" prompt
            if (error.name === 'ExitPromptError') {
                continueCreating = false;
            } else {
                throw error;
            }
        }
    }
    
    // Goodbye message
    console.log('\n');
    console.log(chalk.yellow('⚔️  ═══════════════════════════════════════════════════════════  ⚔️'));
    console.log(chalk.bold.cyan('                    FAREWELL, NOBLE KNIGHT!                       '));
    console.log(chalk.cyan('              May your quests bring glory to the realm!           '));
    console.log(chalk.yellow('⚔️  ═══════════════════════════════════════════════════════════  ⚔️'));
    console.log('\n');
    
    // Close database connection
    await db.close();
    process.exit(0);
}

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n\n⚔️  Quest interrupted. Farewell, noble knight!\n'));
    await db.close();
    process.exit(0);
});

// Run the application
main().catch(async (error) => {
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
        displayError(
            'CONNECTION FAILED',
            'Could not connect to the database.',
            'Make sure PostgreSQL is running and check your .env configuration'
        );
    } else {
        console.error(chalk.red('\n❌ Fatal error:'), error.message);
    }
    await db.close();
    process.exit(1);
});
