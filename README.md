# Knights Quest

A Node.js command-line application that lets users assemble fantasy quests by querying a PostgreSQL database. Select realms, choose characters, assign items, and create quest records through an interactive terminal interface.

## Tech Stack

- **Runtime:** Node.js v18+ (ES Modules)
- **Database:** PostgreSQL 14+
- **CLI:** inquirer 9.x
- **DB Client:** pg 8.x
- **Config:** dotenv 16.x

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 14 or higher
- npm

## Setup

### 1. Clone and install dependencies

```bash
cd knights-quest
npm install
```

### 2. Create the database

```bash
createdb knights_quest
```

### 3. Configure environment

Create a `.env` file in the project root:

```
DATABASE_URL=postgres://user:pass@localhost:5432/knights_quest
```

### 4. Run schema and seed data

```bash
psql -d knights_quest -f db/schema.sql
psql -d knights_quest -f db/seeds.sql
```

## Usage

Start the CLI application:

```bash
node src/cli.js
```

### Quest Creation Flow

1. **Select a Realm** – Choose from 5 legendary kingdoms
2. **Choose Characters** – Pick 1–3 knights or figures from that realm
3. **Assign Items** – Give each character at least one item (items can be shared)
4. **Name Your Quest** – Enter a title for your adventure
5. **Confirm & Save** – Review and save the quest to the database
6. **Loop or Exit** – Create another quest or exit

## Project Structure

```
knights-quest/
├── db/
│   ├── schema.sql      # CREATE TABLE statements
│   └── seeds.sql       # INSERT sample data (King Arthur theme)
├── src/
│   ├── db.js           # pg pool and transaction helpers
│   ├── cli.js          # inquirer prompts and main flow
│   └── queries.js      # SQL query templates
├── .env                # Database connection (not in git)
├── .gitignore
├── package.json
└── README.md
```

## Database Tables

| Table | Description |
|-------|-------------|
| realms | 5 kingdoms (Camelot, Avalon, Lyonesse, Orkney, Corbenic) |
| characters | 12 knights and figures linked to realms |
| items | 10 legendary artifacts |
| quests | User-created quests |
| quest_assignments | Links quests to characters and items |

## Verification

After creating quests, verify in DBeaver or psql:

```sql
SELECT * FROM quests;
SELECT qa.*, c.name AS character, i.name AS item
FROM quest_assignments qa
JOIN characters c ON qa.character_id = c.id
JOIN items i ON qa.item_id = i.id;
```

## License

MIT
