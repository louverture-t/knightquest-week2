# Knights Quest - Product Requirements

## Project Overview

| Field | Details |
|------|---------|
| Project Name | Knights Quest |
| Type | Command-Line Application (CLI) |
| Module | Database Foundations (Module 2) |
| Duration | 1 Week |
| Theme | King Arthur / Knights of the Round Table |

**Summary**

Build a Node.js command-line application that allows users to assemble fantasy quests by querying a PostgreSQL database. Users select realms, choose characters, assign items, and create quest records through an interactive terminal interface.

## Tech Stack

| Layer | Technology | Version | Purpose |
|------|------------|---------|---------|
| Runtime | Node.js | v18+ | JavaScript execution (ES Modules support) |
| Language | JavaScript | ES6+ | Application logic (no TypeScript) |
| Module System | ES Modules | - | import/export syntax |
| Database | PostgreSQL | 14+ | Relational data storage |
| DB Client | pg (node-postgres) | 8.x | Database connection and queries |
| CLI Interface | inquirer | 9.x | Interactive command-line prompts (ES Modules) |
| Configuration | dotenv | 16.x | Environment variable management |
| DB GUI | DBeaver | Latest | Database visualization and testing |

## Critical Configuration

Your package.json must include:

```json
{
  "type": "module"
}
```

## Database Schema Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE RELATIONSHIPS                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐         ┌──────────────┐                    │
│   │  realms  │◄────────│  characters  │                    │
│   │──────────│   1:N   │──────────────│                    │
│   │ id (PK)  │         │ id (PK)      │                    │
│   │ name     │         │ name         │                    │
│   │ ruler    │         │ role         │                    │
│   │ descrip. │         │ realm_id(FK) │                    │
│   └────┬─────┘         └──────────────┘                    │
│        │                                                    │
│        │ 1:N           ┌──────────┐                        │
│        │               │  items   │                        │
│        │               │──────────│                        │
│        │               │ id (PK)  │                        │
│        │               │ name     │                        │
│        │               │ type     │                        │
│        │               │ power    │                        │
│        │               └────┬─────┘                        │
│        │                    │                              │
│        ▼                    ▼                              │
│   ┌──────────┐      ┌──────────────────┐                  │
│   │  quests  │◄─────│ quest_assignments │                  │
│   │──────────│  1:N │──────────────────│                  │
│   │ id (PK)  │      │ id (PK)          │                  │
│   │ title    │      │ quest_id (FK)    │                  │
│   │ realm_id │      │ character_id(FK) │                  │
│   │ created  │      │ item_id (FK)     │                  │
│   └──────────┘      └──────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Table Definitions

#### realms

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| ruler | VARCHAR(100) | |
| description | TEXT | |

#### characters

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| role | VARCHAR(50) | |
| realm_id | INTEGER | REFERENCES realms(id) |

#### items

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| type | VARCHAR(50) | |
| power | INTEGER | |

#### quests

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(150) | NOT NULL |
| realm_id | INTEGER | REFERENCES realms(id) |
| created_at | TIMESTAMP | DEFAULT now() |

#### quest_assignments

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| quest_id | INTEGER | REFERENCES quests(id) ON DELETE CASCADE |
| character_id | INTEGER | REFERENCES characters(id) |
| item_id | INTEGER | REFERENCES items(id) |

## Seed Data: King Arthur Theme

### Realms (5 kingdoms)

| ID | Name | Ruler | Description |
|----|------|-------|-------------|
| 1 | Camelot | King Arthur | The legendary castle and court of King Arthur |
| 2 | Avalon | Lady of the Lake | Mystical island of healing and enchantment |
| 3 | Lyonesse | King Meliodas | Sunken kingdom off the coast of Cornwall |
| 4 | Orkney | King Lot | Northern realm of fierce warriors |
| 5 | Corbenic | Fisher King | Castle of the Holy Grail |

### Characters (12 knights and figures)

| ID | Name | Role | Realm |
|----|------|------|-------|
| 1 | King Arthur | King | Camelot |
| 2 | Sir Lancelot | Knight | Camelot |
| 3 | Sir Gawain | Knight | Camelot |
| 4 | Merlin | Wizard | Camelot |
| 5 | Queen Guinevere | Queen | Camelot |
| 6 | Morgan le Fay | Enchantress | Avalon |
| 7 | Lady of the Lake | Sorceress | Avalon |
| 8 | Sir Tristan | Knight | Lyonesse |
| 9 | Sir Mordred | Knight | Orkney |
| 10 | Sir Agravain | Knight | Orkney |
| 11 | Sir Galahad | Knight | Corbenic |
| 12 | Sir Percival | Knight | Corbenic |

### Items (10 legendary artifacts)

| ID | Name | Type | Power |
|----|------|------|-------|
| 1 | Excalibur | Weapon | 100 |
| 2 | Excalibur's Scabbard | Armor | 80 |
| 3 | Holy Grail | Relic | 150 |
| 4 | Round Table Shield | Armor | 60 |
| 5 | Merlin's Staff | Weapon | 90 |
| 6 | Lancelot's Sword | Weapon | 85 |
| 7 | Healing Potion of Avalon | Potion | 40 |
| 8 | Cloak of Invisibility | Armor | 70 |
| 9 | Dragon's Bane Spear | Weapon | 75 |
| 10 | Amulet of Protection | Relic | 50 |

## Functional Requirements

### Core Features

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F1 | Realm Selection | Display all realms, user selects one | Must Have |
| F2 | Character Selection | Show characters from selected realm, pick 1-3 | Must Have |
| F3 | Item Assignment | Display items, assign ≥1 item per character (items can be shared) | Must Have |
| F4 | Quest Naming | Enter quest title | Must Have |
| F5 | Summary Display | Show complete quest composition before confirming | Must Have |
| F6 | Database Insert | Save quest and assignments using transaction | Must Have |
| F7 | Loop Flow | Offer to create another quest after completion | Must Have |

### CLI Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI FLOW DIAGRAM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   START                                                     │
│     │                                                       │
│     ▼                                                       │
│   ┌─────────────────────┐                                  │
│   │ Welcome Message     │                                  │
│   └──────────┬──────────┘                                  │
│              │                                              │
│   ┌──────────▼──────────┐                                  │
│   │ [1] Select Realm    │◄─────────────────────┐           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [2] Select 1-3      │                      │           │
│   │     Characters      │                      │           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [3] Assign Items    │                      │           │
│   │  (≥1 per character) │                      │           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [4] Enter Quest     │                      │           │
│   │     Title           │                      │           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [5] Display Summary │                      │           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [6] Confirm?        │── No ──► Cancel      │           │
│   └──────────┬──────────┘                      │           │
│              │ Yes                              │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [7] Save to DB      │                      │           │
│   │   (Transaction)     │                      │           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐                      │           │
│   │ [8] Success!        │                      │           │
│   └──────────┬──────────┘                      │           │
│              │                                  │           │
│   ┌──────────▼──────────┐      Yes             │           │
│   │ Create Another?     │──────────────────────┘           │
│   └──────────┬──────────┘                                  │
│              │ No                                           │
│              ▼                                              │
│   ┌─────────────────────┐                                  │
│   │ Goodbye Message     │                                  │
│   │ Close DB Connection │                                  │
│   └─────────────────────┘                                  │
│              │                                              │
│              ▼                                              │
│            EXIT                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Item Assignment Logic

```
┌─────────────────────────────────────────────────────────────┐
│              ITEM ASSIGNMENT RULES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ Each character MUST have at least 1 item               │
│  ✓ Items CAN be shared by multiple characters             │
│  ✓ Characters can have multiple items                     │
│                                                             │
│  Example prompt for each character:                        │
│                                                             │
│    "Assign items to Sir Lancelot (Knight):"                │
│    ┌────────────────────────────────────┐                  │
│    │ ☑ Excalibur (Weapon, Power: 100)  │                  │
│    │ ☐ Holy Grail (Relic, Power: 150)  │                  │
│    │ ☑ Round Table Shield (Armor: 60)  │                  │
│    │ ☐ ...                              │                  │
│    └────────────────────────────────────┘                  │
│                                                             │
│  Resulting quest_assignments rows:                         │
│  ┌─────────────────────────────────────────────┐          │
│  │ quest_id │ character_id │ item_id           │          │
│  │    1     │      2       │    1 (Excalibur)  │          │
│  │    1     │      2       │    4 (Shield)     │          │
│  │    1     │      3       │    1 (Excalibur)  │ ◄─shared │
│  │    1     │      3       │    6 (Sword)      │          │
│  └─────────────────────────────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| **Error Handling** | Graceful handling of DB connection failures, empty results |
| **Input Validation** | Validate user selections (1-3 characters, ≥1 item per character, non-empty title) |
| **Code Organization** | Separate concerns: db.js, queries.js, cli.js |
| **SQL Security** | Use parameterized queries ($1, $2) to prevent SQL injection |
| **Data Integrity** | Use transactions for multi-table inserts |
| **Module System** | ES Modules (import/export syntax) |

## Database Transactions

A transaction groups multiple SQL statements into one "all-or-nothing" operation. Either ALL statements succeed, or NONE of them do.

### Why Needed for Knights Quest

- Insert into `quests` table first (to get the quest ID)
- Then insert multiple rows into `quest_assignments`
- If any assignment fails, you don't want an orphan quest record

### The Three Commands

| Command | Purpose |
|---------|---------|
| `BEGIN` | Start a transaction block |
| `COMMIT` | Save all changes permanently |
| `ROLLBACK` | Undo all changes since BEGIN |

### Visual Example

```
WITHOUT TRANSACTION (Dangerous):
─────────────────────────────────────
INSERT quest ──► Success (quest id=5)
INSERT assignment 1 ──► Success
INSERT assignment 2 ──► ❌ FAILS!

Result: Quest exists but is incomplete! 💥


WITH TRANSACTION (Safe):
─────────────────────────────────────
BEGIN
INSERT quest ──► Success (quest id=5)
INSERT assignment 1 ──► Success  
INSERT assignment 2 ──► ❌ FAILS!
ROLLBACK ◄── Triggered by error

Result: Database unchanged, as if nothing happened ✅
```

## Project Structure

```
knights-quest/
├── db/
│   ├── schema.sql          # CREATE TABLE statements
│   └── seeds.sql           # INSERT sample data (King Arthur theme)
├── src/
│   ├── db.js               # Database connection pool + transaction helper
│   ├── queries.js          # SQL query strings
│   └── cli.js              # Main application + inquirer prompts
├── .env                    # DATABASE_URL configuration
├── .gitignore              # Ignore node_modules, .env
├── package.json            # Dependencies and scripts (type: module)
└── README.md               # Setup and usage instructions
```

## Success Criteria

### Technical Success Checklist

| # | Criteria | How to Verify |
|---|----------|---------------|
| 1 | ES Modules work | `import` statements execute without error |
| 2 | Schema creates all 5 tables | Run in DBeaver, check table list |
| 3 | Foreign keys enforce integrity | Try inserting invalid realm_id, should fail |
| 4 | Seeds populate correctly | Query each table, verify row counts |
| 5 | CLI launches | `node src/cli.js` shows welcome message |
| 6 | Realm query works | List displays all 5 realms |
| 7 | Character filter works | Only characters from selected realm appear |
| 8 | Item validation works | Cannot proceed without ≥1 item per character |
| 9 | Transaction saves atomically | Quest + all assignments saved together |
| 10 | Loop works | Can create multiple quests in one session |
| 11 | Clean exit | Goodbye message, DB connection closed |
