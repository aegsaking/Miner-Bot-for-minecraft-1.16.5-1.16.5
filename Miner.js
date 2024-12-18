const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const mcDataLoader = require('minecraft-data');
const { GoalBlock } = goals;

// Создание бота
const bot = mineflayer.createBot({
  host: 'TestBotsHub.aternos.me', // IP сервера
  port: 11670,                    // Порт сервера
  username: 'IntelligentBot',     // Имя бота
  version: '1.16.5'               // Версия сервера
});

let mcData; // Загрузка данных Minecraft
let language = 'Русский'; // Язык по умолчанию

// Когда бот заходит на сервер
bot.once('spawn', () => {
  mcData = mcDataLoader(bot.version); // Загрузка данных Minecraft

  // Загрузка плагина после загрузки данных
  bot.loadPlugin(pathfinder);

  bot.chat(getLocalizedMessage('greeting', 'Русский'));
  bot.chat(getLocalizedMessage('commandsList', 'Русский'));
  setTimeout(() => {
    bot.chat(getLocalizedMessage('greeting', 'English'));
    bot.chat(getLocalizedMessage('commandsList', 'English'));
  }, 3000);

  // Функция для проверки, является ли предмет броней
  function isArmor(item) {
    const armorTypes = ['helmet', 'chestplate', 'leggings', 'boots'];
    return armorTypes.some(type => item.name.includes(type));
  }

  // Собственная схема для экипировки
  async function equipBestArmor() {
    const items = bot.inventory.items().filter(isArmor);
    for (const item of items) {
      try {
        await bot.equip(item, 'armor');
        bot.chat(`Экипировал ${item.displayName}.`);
      } catch (err) {
        bot.chat(`Ошибка при экипировке ${item.displayName}: ${err.message}`);
      }
    }
  }

  bot.on('playerCollect', (collector, item) => {
    if (collector.username === bot.username) {
      setTimeout(async () => {
        try {
          await bot.waitForTicks(5); // Ждем синхронизации инвентаря
          await equipBestArmor(); // Собственная экипировка
        } catch (err) {
          bot.chat(`Ошибка при экипировке: ${err.message}`);
        }
      }, 1000);
    }
  });

  bot.chat('Для списка команд введите !команды.');
});

// Обработка чата
bot.on('chat', (username, message) => {
  if (!message.startsWith('!')) return; // Игнорируем сообщения без '!' в начале
  const currentTime = new Date().toLocaleString();
  if (username === bot.username) return;

  if (message === '!English') {
    language = 'English';
    bot.chat('Language set to English.');
    return;
  }

  if (message === '!Русский') {
    language = 'Русский';
    bot.chat('Язык установлен на русский.');
    return;
  }

  const args = message.split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case '!добудь':
    case '!mine':
      if (args[1]) {
        const oreName = args[1];
        const quantity = parseInt(args[2], 10) || 1;
        mineAllOre(oreName, quantity);
      } else {
        bot.chat(language === 'Русский' ? 'Пожалуйста, укажите тип руды и количество. Пример: !добудь diamond_ore 5' : 'Please specify the type of ore and quantity. Example: !mine diamond_ore 5');
      }
      break;

    case '!стоп':
    case '!stop':
      stopActions();
      break;

    case '!экипировка':
    case '!equipment':
      checkEquipment();
      break;

    case '!команды':
    case '!commands':
      bot.chat(getLocalizedMessage('commandsList'));
      break;

    case '!скинь':
    case '!toss':
      const itemName = args[1];
      const quantity = parseInt(args[2], 10) || 1;
      const player = bot.players[username];
      if (player) {
        slowlyLookAtPlayer(player);
      }
      const item = bot.inventory.items().find(i => i.name.includes(itemName));
      if (item) {
        try {
          bot.toss(item.type, null, quantity);
          bot.chat(language === 'Русский' ? `Выбросил ${quantity} ${item.displayName}.` : `Tossed ${quantity} ${item.displayName}.`);
        } catch (err) {
          bot.chat(language === 'Русский' ? `Ошибка при выбросе ${item.displayName}: ${err.message}` : `Error tossing ${item.displayName}: ${err.message}`);
        }
      } else {
        bot.chat(language === 'Русский' ? `Предмет ${itemName} не найден в инвентаре.` : `Item ${itemName} not found in inventory.`);
      }
      break;

    case '!что есть':
    case '!whatdoihave':
      const oreNames = {
        diamond: language === 'Русский' ? 'Алмазы' : 'Diamonds',
        iron_ore: language === 'Русский' ? 'Железная руда' : 'Iron Ore',
        gold_ore: language === 'Русский' ? 'Золотая руда' : 'Gold Ore',
        coal: language === 'Русский' ? 'Уголь' : 'Coal',
        lapis_ore: language === 'Русский' ? 'Лазурит' : 'Lapis',
        redstone_ore: language === 'Русский' ? 'Редстоун' : 'Redstone',
        emerald_ore: language === 'Русский' ? 'Изумруды' : 'Emeralds',
        netherite_scrap: language === 'Русский' ? 'Незеритовые обломки' : 'Netherite Scraps'
      };

      const inventorySummary = bot.inventory.items()
        .filter(item => Object.keys(oreNames).includes(item.name))
        .reduce((summary, item) => {
          const oreName = oreNames[item.name] || item.displayName;
          summary[oreName] = (summary[oreName] || 0) + item.count;
          return summary;
        }, {});

      const messageParts = Object.entries(inventorySummary)
        .map(([name, count]) => `${name} ${count}`);

      if (messageParts.length > 0) {
        bot.chat(language === 'Русский' ? `У меня есть: ${messageParts.join(', ')}.` : `I have: ${messageParts.join(', ')}.`);
      } else {
        bot.chat(language === 'Русский' ? 'У меня нет руды в инвентаре.' : 'I have no ores in my inventory.');
      }
      break;

    default:
      bot.chat(getLocalizedMessage('unknownCommand'));
  }
});

// Обработка команды !скинь
bot.on('chat', async (username, message) => {
  if (!message.startsWith('!')) return; // Игнорируем сообщения без '!' в начале
  if (username === bot.username) return; // Игнорируем собственные сообщения

  const args = message.split(' ');
  const command = args[0].toLowerCase();
  const itemName = args[1];
  const quantity = parseInt(args[2], 10) || 1;

  if (command === '!скинь' && itemName) {
    const player = bot.players[username];
    if (player) {
      await slowlyLookAtPlayer(player);
    }

    const item = bot.inventory.items().find(i => i.name.includes(itemName));
    if (item) {
      try {
        await bot.toss(item.type, null, quantity);
        bot.chat(`Выбросил ${quantity} ${item.displayName}.`);
      } catch (err) {
        bot.chat(`Ошибка при выбросе ${item.displayName}: ${err.message}`);
      }
    } else {
      bot.chat(`Предмет ${itemName} не найден в инвентаре.`);
    }
  }
});

// Обработка команды !Что есть
bot.on('chat', (username, message) => {
  if (!message.startsWith('!')) return; // Игнорируем сообщения без '!' в начале
  if (username === bot.username) return;

  if (message === '!что есть') {
    const oreNames = {
      diamond: 'Алмазы',
      iron_ore: 'Железная руда',
      gold_ore: 'Золотая руда',
      coal: 'Уголь',
      lapis_ore: 'Лазурит',
      redstone_ore: 'Редстоун',
      emerald_ore: 'Изумруды',
      netherite_scrap: 'Незеритовые обломки'
    };

    const inventorySummary = bot.inventory.items()
      .filter(item => Object.keys(oreNames).includes(item.name))
      .reduce((summary, item) => {
        const oreName = oreNames[item.name] || item.displayName;
        summary[oreName] = (summary[oreName] || 0) + item.count;
        return summary;
      }, {});

    const messageParts = Object.entries(inventorySummary)
      .map(([name, count]) => `${name} ${count}`);

    if (messageParts.length > 0) {
      bot.chat(`У меня есть: ${messageParts.join(', ')}.`);
    } else {
      bot.chat('У меня нет руды в инвентаре.');
    }
  }
});

// Обработка сообщений в чате с выводом времени
bot.on('chat', (username, message) => {
  if (!message.startsWith('!')) return; // Игнорируем сообщения без '!' в начале
  const currentTime = new Date().toLocaleString();
  console.log(`[${currentTime}] ${username}: ${message}`);
});

// Проверка текущей экипировки
function checkEquipment() {
  const helmet = bot.inventory.slots[5]?.displayName || 'Нет';
  const chestplate = bot.inventory.slots[6]?.displayName || 'Нет';
  const leggings = bot.inventory.slots[7]?.displayName || 'Нет';
  const boots = bot.inventory.slots[8]?.displayName || 'Нет';
  bot.chat(`Экипировка: Шлем: ${helmet}, Нагрудник: ${chestplate}, Поножи: ${leggings}, Ботинки: ${boots}`);
}

// Карта высот руд
const oreHeights = {
  diamond_ore: 16,
  iron_ore: 64,
  gold_ore: 32,
  coal_ore: 128,
  default: 64
};

// Добыча руды
async function mineAllOre(oreName, quantity) {
  const oreHeight = oreHeights[oreName] || 11; // Дефолтная высота для руд
  try {
    await moveToHeight(oreHeight);
    bot.chat(`Перемещаюсь на высоту ${oreHeight} для поиска ${oreName}.`);
    let mined = 0;
    const oreId = mcData.blocksByName[oreName]?.id;
    if (!oreId) {
      bot.chat(`Руда ${oreName} не найдена в данных Minecraft.`);
      return;
    }
    while (mined < quantity) {
      const block = bot.findBlock({
        matching: oreId,
        maxDistance: 64
      });
      if (block) {
        bot.chat(`Найден блок ${block.name} на (${block.position.x}, ${block.position.y}, ${block.position.z}).`);
        if (block.name === oreName) {
          try {
            await bot.pathfinder.goto(new GoalBlock(block.position.x, block.position.y, block.position.z));
            await bot.dig(block);
            mined++;
            bot.chat(`Добыто ${mined}/${quantity} ${oreName}.`);
          } catch (err) {
            bot.chat(`Ошибка при добыче: ${err.message}`);
          }
        } else {
          bot.chat(`Найденный блок не соответствует ${oreName}, пропускаю.`);
        }
      } else {
        bot.chat(`Не удалось найти больше блоков ${oreName}.`);
        break;
      }
    }
  } catch (err) {
    bot.chat(`Ошибка при перемещении на высоту: ${err.message}`);
  }
}

// Перемещение на заданную высоту
function moveToHeight(height) {
  return new Promise((resolve, reject) => {
    const currentY = Math.floor(bot.entity.position.y);
    if (currentY === height) {
      resolve();
      return;
    }

    bot.pathfinder.setGoal(new GoalBlock(bot.entity.position.x, height, bot.entity.position.z));
    bot.once('goal_reached', resolve);
    bot.once('path_update', pathUpdate => {
      if (pathUpdate.status === 'noPath') reject(new Error('Нет пути к указанной высоте.'));
    });
  });
}

// Остановка действий
function stopActions() {
  bot.pathfinder.setGoal(null); // Сброс цели
  bot.chat('Все действия остановлены.');
}

// Обработка выхода бота с сервера
bot.on('end', () => {
  console.error('Бот был отключен от сервера.');
});

bot.on('kicked', (reason) => {
  console.error('Бот был кикнут с сервера:', reason);
});

// Проверка данных перед обработкой
bot._client.on('entity_metadata', (packet) => {
  if (packet.metadata && packet.metadata[1]?.value !== undefined) {
    bot.oxygenLevel = Math.round(packet.metadata[1].value / 15);
  }
});

// Медленное поворачивание к игроку
async function slowlyLookAtPlayer(player) {
  const { position } = player.entity;
  const botPosition = bot.entity.position;
  const dx = position.x - botPosition.x;
  const dy = position.y - botPosition.y;
  const dz = position.z - botPosition.z;
  const yaw = Math.atan2(-dx, -dz);
  const pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));

  for (let i = 0; i <= 10; i++) {
    bot.look(yaw * (i / 10), pitch * (i / 10), true);
    await bot.waitForTicks(1);
  }
}

function getLocalizedMessage(key, lang = language) {
  const messages = {
    Русский: {
      greeting: 'Привет! Бот готов к работе.',
      commandsList: 'Доступные команды: !добудь <руда> <количество>, !стоп, !экипировка, !команды, !скинь <предмет>, !что есть, !English, !Русский',
      unknownCommand: 'Неизвестная команда. Используйте !команды для списка доступных команд.'
    },
    English: {
      greeting: 'Hello! The bot is ready.',
      commandsList: 'Available commands: !mine <ore> <quantity>, !stop, !equipment, !commands, !toss <item>, !whatdoihave, !English, !Русский',
      unknownCommand: 'Unknown command. Use !commands for a list of available commands.'
    }
  };
  return messages[lang][key];
}
