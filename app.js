// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

// ================== НАСТРОЙКИ ==================
const TOKEN = '8279517460:AAGSc3Z8O-yRCkc7s4PCCns-DWhe2UwnKpg';
const PORT = 3000;

// ================== ИНИЦИАЛИЗАЦИЯ БОТА ==================
const bot = new TelegramBot(TOKEN, { polling: true });
let activeChats = [];

// Пользователь пишет /start — добавляем в список активных чатов
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    if (!activeChats.includes(chatId)) activeChats.push(chatId);
    bot.sendMessage(chatId, "Бот активирован! Теперь вы будете получать результаты игр.");
});

// Функция отправки сообщения всем активным пользователям
function sendTelegramMessage(message) {
    activeChats.forEach(chatId => {
        bot.sendMessage(chatId, message).catch(err => console.error(err));
    });
}

// ================== ИНИЦИАЛИЗАЦИЯ СЕРВЕРА ==================
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Маршрут для получения результатов игры
app.post('/game', (req, res) => {
    const { result, promoCode } = req.body;
    if (!result) return res.status(400).json({ error: 'Не указан результат игры' });

    const now = new Date();
    const timeString = now.toLocaleString("ru-RU", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    });

    let message = `Игра от ${timeString} — ${result}`;
    if (promoCode) message += `\nПользователь забрал свой промокод: ${promoCode} !!!`;

    // Отправляем всем активным пользователям
    sendTelegramMessage(message);

    res.json({ status: 'ok', message });
});

// Запуск сервера
app.listen(PORT, () => console.log(`Сервер и бот запущены на http://localhost:${PORT}`));
