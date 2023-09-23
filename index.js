const TelegramApi = require("node-telegram-bot-api");
const token = "6408315918:AAEEooKAwXUylHuVwja2NHojXVYvdDde2-w";
const bot = new TelegramApi(token, { polling: true });
const chats = {};
const { gameOptions, againOptions } = require('./options')
const mongoose = require("mongoose")

const startGame = async (chatId) => {
  await bot.sendMessage(
      chatId,
      "Аз си намислям едно число от 0 до 9, а ти се опитваш да го познаеш.",
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(
      chatId,
      "Нека започнем играта сега! Познай какво число си намислих?",
      gameOptions,
  );
}

mongoose
    .connect("mongodb://127.0.0.1:27017/telegram_bot")
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log("DB Error", err));

const start = () => {


  bot.setMyCommands([
    { command: "/start", description: "Начален поздрав" },
    { command: "/info", description: "Информация за акаунта" },
    { command: "/game", description: "Започни игра!" },
  ]);

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.eu/_/stickers/385/a4b/385a4bf5-3feb-3008-be6e-1074767a1f3d/7.webp",
      );
      return bot.sendMessage(chatId, `Добре дошли в игра на отгатвания`);
    }
    if (text === "/info") {
      return bot.sendMessage(chatId, `Ти се казваш ${msg.from.first_name}`);
    }

    if (text === "/game") {
      return startGame(chatId)
    }
    return bot.sendMessage(chatId, "Не те разбирам, bro.");
  });
  bot.on("callback_query", async (msg) => {
    const chatId = msg.message.chat.id;
    const data = msg.data;
    const username = msg.from.first_name;
    if (data == '/again') {
        return startGame(chatId)
    }

    if (data == chats[chatId]) {
      return await bot.sendMessage(
        chatId,
        `БРАВО ${username}! Позна, че числото беше ${chats[chatId]}! Ти си жива Ванга!`, againOptions,
      );
    } else {
      return await bot.sendMessage(
        chatId,
        `Много си прост ${username}, не позна, че си намислих ${chats[chatId]}`, againOptions,
      );
    }
  });
};

start();
