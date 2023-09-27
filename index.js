// създаваме променлива за работа с API
const TelegramApi = require("node-telegram-bot-api");
//  от BotFather взимаме токен за работа с бота
const token = "6408315918:AAEEooKAwXUylHuVwja2NHojXVYvdDde2-w";
// създаваме нов клас и заваме настройки
const bot = new TelegramApi(token, { polling: true });
// създаваме обект за генериране на random числата
const chats = {};
// извличаме настрийките от options.js
const { gameOptions, againOptions } = require("./options");

// работа с база данни (MongoDB)
const mongoose = require("mongoose");
const User = require("./models");

// асинхронна функция за генериране на random число
const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Аз си намислям едно число от 0 до 9, а ти се опитваш да го познаеш.",
  );
  chats[chatId] = Math.floor(Math.random() * 10);
  await bot.sendMessage(
    chatId,
    "Нека започнем играта сега! Познай какво число си намислих?",
    gameOptions,
  );
};

// свързване с база данните (може да се изнесе в отделен фаил при по-големи настройки)
mongoose
  .connect("mongodb://127.0.0.1:27017/telegram_bot")
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log("DB Error", err));

//  функция за проверка за вече съществуваща база данни
const checker = async (chatId) => {
  const bd = await User.findOne({ chatId: chatId }).exec();
  return bd;
};

// функция за стартиране на бота
const start = async () => {
  // показваме бутони в телеграм за информация и започваме на нова игра
  bot.setMyCommands([
    { command: "/info", description: "Информация за акаунта" },
    { command: "/game", description: "Започни нова игра!" },
  ]);

  bot.on("message", async (msg) => {
    // Извличаме необходимите данни от телеграм
    const text = msg.text;
    const chatId = msg.chat.id;
    // Създаваме база данни за новата игра и задаваме начални стойности
    if (!(await checker(chatId))) {
      await User.create({ chatId: chatId, wrong: 0, right: 0 });
    }
    // при команда "start" се показва начален поздрав
    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/7.webp",
      );
      return bot.sendMessage(chatId, `Добре дошли в игра на отгатвания`);
    }
    //  при команда "info" се поазва информация и статистика на играча
    if (text === "/info") {
      const user = await User.findOne({ chatId: chatId });
      return bot.sendMessage(
        chatId,
        `Ти се казваш ${msg.from.first_name}. Имаш ${user.wrong} грешни отговра и ${user.right} верни`,
      );
    }
    //  при команда "game" пуска функцията за генериране на ново число
    if (text === "/game") {
      return startGame(chatId);
    }
    // при команда, която я няма описана се изпраща съобщение
    return bot.sendMessage(chatId, "Не те разбирам, bro.");
  });

  // логика за полчаване на данни и изпращането им към базата данни
  bot.on("callback_query", async (msg) => {
    //  Извличаме необходимата информация от телеграм
    const chatId = msg.message.chat.id;
    const data = msg.data;
    const username = msg.from.first_name;
    if (data == "/again") {
      return startGame(chatId);
    }

    if (data == chats[chatId]) {
      //  При правилен отговор изпращаме съобщение, показваме бутон за нова игра и записваме резултата в БД
      return await bot.sendMessage(
        chatId,
        `БРАВО ${username}! Позна числото ${chats[chatId]}!`,
        againOptions,
        //    добавяме резултата към базата данни
        User.findOneAndUpdate(
          { chatId: chatId },
          { $inc: { right: +1 } },
        ).exec(),
      );
    } else {
      //  При грешен отговор изпращаме съобщение, показваме бутон за нова игра и записваме резултата в БД
      return await bot.sendMessage(
        chatId,
        `Грешен отговор, ${username}. Числото, което си намислих е ${chats[chatId]}`,
        againOptions,
        //   добавяме резултата към базата данни
        User.findOneAndUpdate(
          { chatId: chatId },
          { $inc: { wrong: +1 } },
        ).exec(),
      );
    }
  });
};

start();
