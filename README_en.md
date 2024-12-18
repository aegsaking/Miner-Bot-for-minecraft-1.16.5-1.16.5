Конечно! Вот английская версия README:

---

# IntelligentBot

A Minecraft bot capable of performing automated tasks, such as mining ores, managing inventory and equipment, and executing chat commands. The bot supports two languages: Russian and English.

## Features
- **Automated Mining**: `!mine <ore> <quantity>` or `!добудь <руда> <количество>`.
- **Equipment Management**: `!equipment` or `!экипировка`.
- **Item Tossing**: `!toss <item> <quantity>` or `!скинь <предмет> <количество>`.
- **Inventory Check**: `!whatdoihave` or `!что есть`.
- **Language Switching**: `!English` or `!Русский`.
- **Stop Actions**: `!stop` or `!стоп`.
- **Command List**: `!commands` or `!команды`.

## Requirements
Before running the bot, make sure you have:
- Node.js version **14.17.0** or later.
- NPM (comes with Node.js).
- Minecraft Java Edition version **1.16.5**.

## Installation
1. Download the code from the repository.
2. Install dependencies by running:
   ```bash
   npm install
   ```

## Configuration
Edit the connection settings in the code file:
```javascript
const bot = mineflayer.createBot({
  host: 'TestBotsHub.aternos.me', // Minecraft server IP
  port: 11670,                    // Server port
  username: 'IntelligentBot',     // Bot username
  version: '1.16.5'               // Server version
});
```

- **host**: The Minecraft server's IP address.
- **port**: The server port.
- **username**: The bot's username.
- **version**: The Minecraft server version.

## Usage
Start the bot by running:
```bash
node bot.js
```

Once started, the bot will connect to the specified server and be ready to interact.

## Commands
You can send commands in the Minecraft chat to interact with the bot. For example:
- `!mine diamond_ore 5` — The bot will mine 5 diamond ore blocks.
- `!toss diamond 3` — The bot will toss 3 diamonds.
- `!whatdoihave` — The bot will list ores in its inventory.

You can see the full list of commands by typing `!commands`.

## Key Features
### Mining Ores
The `!mine` or `!добудь` command allows you to specify the type of ore and quantity to mine. The bot will automatically move to the appropriate height and start mining.

### Inventory Management
The bot can automatically equip the best armor, check its current equipment, and toss specified items.

### Language Switching
The `!English` command will switch the bot's language to English, while `!Русский` will switch it to Russian.

## Notes
- For the bot to work correctly, it must have access to blocks and commands on the server.
- Some features, such as automated mining, may require administrator permissions depending on the server settings.

## License
This project is distributed under the **MIT License**. You are free to use, modify, and distribute the code with proper attribution.

