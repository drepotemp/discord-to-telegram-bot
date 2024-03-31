const Discord = require("discord.js");
const TelegramBot = require("node-telegram-bot-api");
const responses = require("./responses");
require('dotenv').config();

// Discord Bot Token
const discordBotToken = process.env.discordBotToken

// Telegram Bot Token
const telegramBotToken = process.env.telegramBotToken

// Telegram Chat ID (where messages will be sent)
const telegramChatId = process.env.telegramChatId

// Initialize Telegram bot
const telegramBot = new TelegramBot(telegramBotToken, { polling: true });

// Function to start the Discord bot with retry logic
const startDiscordBotWithRetry = () => {
  // Initialize Discord client
  const discordClient = new Discord.Client();

  // Discord event: ready
  discordClient.once("ready", () => {
    console.log("Discord Bot is now connected.");
  });

  // Discord event: message
  discordClient.on("message", async (message) => {
    try {
      // Ignore messages from other bots
      if (message.author.bot) return;

      // Check if the message has attachments (images)
      if (message.attachments.size > 0) {
        // If message has attachments
        message.attachments.forEach((attachment) => {
          if (message.content) {
            // If there's also a text caption, send the image with the caption
            telegramBot.sendPhoto(telegramChatId, attachment.url, {
              caption: message.content,
            });
          } else {
            // If there's no caption, send only the image
            telegramBot.sendPhoto(telegramChatId, attachment.url);
          }
        });
      } else if (message.content.trim().length > 0) {
        // If message doesn't have attachments but has content, send text content only
        telegramBot.sendMessage(telegramChatId, message.content);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Discord event: close
  discordClient.once("close", () => {
    console.log("Discord Bot connection closed.");
    console.log("Retrying to connect Discord Bot in 5 seconds...");
    setTimeout(startDiscordBotWithRetry, 5000); // Retry after 5 seconds
  });

  // Discord event: error
  discordClient.once("error", (error) => {
    console.error("Error connecting Discord Bot:", error.message);
    console.log("Retrying to connect Discord Bot in 5 seconds...");
    setTimeout(startDiscordBotWithRetry, 5000); // Retry after 5 seconds
  });

  // Discord Bot login
  discordClient.login(discordBotToken).catch((error) => {
    console.error("Error connecting Discord Bot:", error.message);
    console.log("Retrying to connect Discord Bot in 5 seconds...");
    setTimeout(startDiscordBotWithRetry, 5000); // Retry after 5 seconds
  });
};

// Start the Discord bot with retry logic
startDiscordBotWithRetry();

// Set bot commands for Telegram
telegramBot.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "customize", description: "Set up for your usage" },
  // Add more commands as needed
]);


// Telegram event: message
telegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the message is a command
  if (messageText.startsWith("/start")) {
    // Respond to /start command
    telegramBot.sendMessage(chatId, responses.start);
  } else if (messageText.startsWith("/customize")) {
    // Respond to /hello command
    telegramBot.sendMessage(chatId, responses.customize);
  }
  // Add more commands as needed
});