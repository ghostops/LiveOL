# LiveOL CLI - Mock Results Generator

CLI tool for creating and managing mock live orienteering results for testing and development.

## Installation

```bash
cd Utils/cli
npm install
```

The CLI runs directly from TypeScript source using `tsx`, so no build step is required.

## Configuration

The CLI uses the Server's database connection. Ensure `server/.env` exists with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/liveol
```

## Commands

### Create a Mock Competition

```bash
livecli create [options]

Options:
  --name <name>       Competition name (default: "[MOCK] Test Competition")
  --organizer <org>   Organizer name (default: "Mock OK")
```

Creates a new mock competition with:
- 1 class (H21E - Elite Men)
- 3 split controls
- 10 runners with Swedish names

**Example:**
```bash
livecli create
livecli create --name "[MOCK] Evening Sprint" --organizer "Test Club"
```

### Progress Runners

```bash
livecli progress <competitionId>
```

Advances all runners through one more control. Run multiple times to complete the race:
1. First run: All runners complete control 1
2. Second run: All runners complete control 2
3. Third run: All runners complete control 3 and finish

**Example:**
```bash
livecli progress 92345
```

### List Mock Competitions

```bash
livecli list [options]

Options:
  --limit <n>  Number to show (default: 10)
```

Shows all mock competitions ordered by creation date.

**Example:**
```bash
livecli list
livecli list --limit 20
```

## Usage Example

```bash
# Create a competition
livecli create --name "[MOCK] Evening Sprint"

# Output will show:
# Creating mock competition: [MOCK] Evening Sprint
#   Competition ID: 92345
#   Class: H21E
#   Controls: 31, 32, 33
#   Runners: 10
#
# ✓ Mock competition created successfully!
#
# To progress runners through controls, run:
#   livecli progress 92345

# Progress through all controls
livecli progress 92345  # Control 1
livecli progress 92345  # Control 2
livecli progress 92345  # Control 3 (finish)

# List all mock competitions
livecli list
```

## Data Format

Mock competitions follow the same database schema as real competitions, making them suitable for:
- Testing the mobile app UI
- Verifying API endpoints
- Load testing with realistic data
- Developing new features

All mock competitions are prefixed with `[MOCK]` to clearly identify them.

## Cleanup

To remove mock competitions from the database:

```sql
DELETE FROM live_split_results WHERE live_result_id IN (
  SELECT live_result_id FROM live_results WHERE live_competition_id IN (
    SELECT id FROM live_competitions WHERE name LIKE '[MOCK]%'
  )
);

DELETE FROM live_results WHERE live_competition_id IN (
  SELECT id FROM live_competitions WHERE name LIKE '[MOCK]%'
);

DELETE FROM live_split_controlls WHERE live_class_id IN (
  SELECT live_class_id FROM live_classes WHERE live_competition_id IN (
    SELECT id FROM live_competitions WHERE name LIKE '[MOCK]%'
  )
);

DELETE FROM live_classes WHERE live_competition_id IN (
  SELECT id FROM live_competitions WHERE name LIKE '[MOCK]%'
);

DELETE FROM live_competitions WHERE name LIKE '[MOCK]%';
```

## Development

```bash
# Run the CLI directly
npm start -- create

# Run linter
npm run lint
```
