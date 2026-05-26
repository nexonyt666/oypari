const fs = require('fs');
const path = require('path');
const db = require('./database');

let botToken = '';
let adminChatId = '';
let isPolling = false;
let abortController = null;
let currentOffset = 0;

// In-memory states for multi-step prompts
const userStates = {};

async function initCredentials() {
    try {
        const tokenRow = await db.get("SELECT value FROM settings WHERE key = 'telegram_bot_token'");
        const chatIdRow = await db.get("SELECT value FROM settings WHERE key = 'telegram_chat_id'");
        botToken = tokenRow ? tokenRow.value.trim() : '';
        adminChatId = chatIdRow ? chatIdRow.value.trim() : '';
    } catch (err) {
        console.error('[Telegram Bot] Credentials load error:', err.message);
    }
}

// REST api calls to Telegram
async function callTelegram(method, body = {}) {
    if (!botToken) return null;
    const url = `https://api.telegram.org/bot${botToken}/${method}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        console.error(`[Telegram Bot] Error in method ${method}:`, err.message);
        return null;
    }
}

async function sendMenu(chatId, text) {
    const keyboard = {
        keyboard: [
            [{ text: '📊 Статистика' }, { text: '🔑 Сырсөз өзгөртүү' }],
            [{ text: '🖼️ Галерея' }, { text: '📁 Долбоорлор' }],
            [{ text: '✉️ Кабарлар (Inbox)' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };

    await callTelegram('sendMessage', {
        chat_id: chatId,
        text: text || 'Каалаган бөлүмдү тандаңыз:',
        reply_markup: keyboard
    });
}

async function handleStart(chatId) {
    userStates[chatId] = { state: 'idle' };
    await sendMenu(chatId, 'Салам! Бул AYPERI портфолио боту. Бул жерден сайтты толук башкара аласыз.');
}

async function handleStats(chatId) {
    try {
        const projCount = await db.get("SELECT COUNT(*) as count FROM projects");
        const galleryCount = await db.get("SELECT COUNT(*) as count FROM gallery");
        const videoCount = await db.get("SELECT COUNT(*) as count FROM videos");
        const msgCount = await db.get("SELECT COUNT(*) as count FROM messages");
        
        const text = `📊 *Сайт статистикасы:*\n\n` +
                     `📁 Долбоорлор саны: *${projCount.count}*\n` +
                     `🖼️ Галерея сүрөттөрү: *${galleryCount.count}*\n` +
                     `🎥 Видеолор: *${videoCount.count}*\n` +
                     `✉️ Кирген кабарлар: *${msgCount.count}*`;
                     
        await callTelegram('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        });
    } catch (err) {
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Ката кетти: ' + err.message });
    }
}

async function handlePasswordPrompt(chatId) {
    userStates[chatId] = { state: 'awaiting_password' };
    await callTelegram('sendMessage', {
        chat_id: chatId,
        text: '🔑 Жаңы администратор сырсөзүн жазыңыз (жокко чыгаруу үчүн /cancel деп жазыңыз):',
        reply_markup: { remove_keyboard: true }
    });
}

async function handlePasswordSave(chatId, text) {
    if (text.startsWith('/') || text.length < 4) {
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Ката: сырсөз өтө кыска же туура эмес. Кайрадан жазыңыз:' });
        return;
    }
    try {
        await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password', ?)", [text]);
        userStates[chatId] = { state: 'idle' };
        await sendMenu(chatId, `✓ Сырсөз ийгиликтүү өзгөртүлдү! Жаңы сырсөз: *${text}*`);
    } catch (err) {
        await sendMenu(chatId, 'Сырсөздү өзгөртүүдө ката кетти: ' + err.message);
    }
}

async function handleGalleryList(chatId) {
    try {
        const rows = await db.all("SELECT * FROM gallery ORDER BY id DESC LIMIT 5");
        let text = '🖼️ *Галереядагы акыркы 5 сүрөт:*\n\n';
        const inlineKeyboard = [];
        
        if (rows.length === 0) {
            text += 'Галерея азырынча бош.';
        } else {
            rows.forEach((row, index) => {
                text += `${index + 1}. *${row.title}* (ID: ${row.id})\n`;
                inlineKeyboard.push([{
                    text: `❌ Өчүрүү: "${row.title.slice(0, 15)}..."`,
                    callback_data: `del_gal_${row.id}`
                }]);
            });
        }
        
        inlineKeyboard.push([{ text: '➕ Жаңы сүрөт кошуу', callback_data: 'add_gal' }]);
        
        await callTelegram('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: inlineKeyboard }
        });
    } catch (err) {
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Ката кетти: ' + err.message });
    }
}

async function handleProjectsList(chatId) {
    try {
        const rows = await db.all("SELECT * FROM projects ORDER BY id DESC LIMIT 5");
        let text = '📁 *Акыркы 5 долбоор:*\n\n';
        const inlineKeyboard = [];
        
        if (rows.length === 0) {
            text += 'Долбоорлор азырынча бош.';
        } else {
            rows.forEach((row, index) => {
                text += `${index + 1}. *${row.title}* (ID: ${row.id})\n`;
                inlineKeyboard.push([{
                    text: `❌ Өчүрүү: "${row.title.slice(0, 15)}..."`,
                    callback_data: `del_proj_${row.id}`
                }]);
            });
        }
        
        inlineKeyboard.push([{ text: '➕ Жаңы долбоор кошуу', callback_data: 'add_proj' }]);
        
        await callTelegram('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: inlineKeyboard }
        });
    } catch (err) {
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Ката кетти: ' + err.message });
    }
}

async function handleMessagesList(chatId) {
    try {
        const rows = await db.all("SELECT * FROM messages ORDER BY id DESC LIMIT 5");
        if (rows.length === 0) {
            await callTelegram('sendMessage', { chat_id: chatId, text: '✉️ Жаңы кабарлар жок.' });
            return;
        }
        
        await callTelegram('sendMessage', { chat_id: chatId, text: '✉️ *Акыркы 5 кабар:*', parse_mode: 'Markdown' });
        
        for (const row of rows) {
            const text = `👤 *Аты:* ${row.name}\n` +
                         `📧 *Email:* ${row.email}\n` +
                         `📅 *Дата:* ${row.date}\n` +
                         `✉️ *Кабар:* ${row.message}`;
            
            const inlineKeyboard = [[{
                text: '❌ Кабарды өчүрүү',
                callback_data: `del_msg_${row.id}`
            }]];
            
            await callTelegram('sendMessage', {
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: inlineKeyboard }
            });
        }
    } catch (err) {
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Ката кетти: ' + err.message });
    }
}

// Download image from telegram API and store it in /uploads folder
async function downloadTelegramPhoto(fileId) {
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    try {
        const res = await fetch(getFileUrl);
        const data = await res.json();
        if (data.ok) {
            const filePath = data.result.file_path;
            const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
            const fileRes = await fetch(downloadUrl);
            const arrayBuffer = await fileRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            
            // Create uploads folder if it doesn't exist
            const uploadsDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            const ext = path.extname(filePath) || '.jpg';
            const filename = `photo_${Date.now()}${ext}`;
            const localPath = path.join(uploadsDir, filename);
            fs.writeFileSync(localPath, buffer);
            
            return `/uploads/${filename}`;
        }
    } catch (err) {
        console.error('[Telegram Bot] Image download error:', err.message);
    }
    return null;
}

// Handle project adding flow
async function handleAddProjectState(chatId, text, message) {
    const state = userStates[chatId];
    if (!state.data) state.data = {};
    
    if (state.state === 'add_proj_title') {
        state.data.title = text;
        state.state = 'add_proj_desc';
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Долбоордун кыскача сүрөттөлүшүн (description) жазыңыз:' });
    } else if (state.state === 'add_proj_desc') {
        state.data.description = text;
        state.state = 'add_proj_url';
        await callTelegram('sendMessage', { chat_id: chatId, text: 'Долбоордун шилтемесин (URL) жазыңыз (мисалы, https://google.com же жок болсо /skip деп жазыңыз):' });
    } else if (state.state === 'add_proj_url') {
        state.data.url = text === '/skip' ? '' : text;
        
        // Save project to SQLite
        try {
            const id = Date.now();
            const date = new Date().toISOString().split('T')[0];
            await db.run(
                "INSERT INTO projects (id, title, status, url, description, date, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [id, state.data.title, 'Активдүү', state.data.url, state.data.description, date, 'Билим берүү', '']
            );
            userStates[chatId] = { state: 'idle' };
            await sendMenu(chatId, `✓ Долбоор ийгиликтүү кошулду!\n*Темасы:* ${state.data.title}`);
        } catch (err) {
            await sendMenu(chatId, 'Долбоорду сактоодо ката кетти: ' + err.message);
        }
    }
}

// Main logic for processing incoming messages
async function processMessage(msg) {
    const chatId = msg.chat.id.toString();
    const text = msg.text ? msg.text.trim() : '';

    // Verify authorized user
    if (chatId !== adminChatId) {
        await callTelegram('sendMessage', {
            chat_id: chatId,
            text: 'Сизде бул ботту колдонууга укук жок. Admin Chat ID туура эмес.'
        });
        return;
    }

    if (text === '/cancel') {
        userStates[chatId] = { state: 'idle' };
        await sendMenu(chatId, 'Жокко чыгарылды.');
        return;
    }

    const state = userStates[chatId] ? userStates[chatId].state : 'idle';

    // Handle states first
    if (state === 'awaiting_password') {
        await handlePasswordSave(chatId, text);
        return;
    }

    if (state && state.startsWith('add_proj_')) {
        await handleAddProjectState(chatId, text, msg);
        return;
    }

    if (state === 'add_gal_photo') {
        if (msg.photo && msg.photo.length > 0) {
            // Get largest photo size
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            const title = msg.caption || `Сүрөт ${new Date().toLocaleDateString()}`;
            
            await callTelegram('sendMessage', { chat_id: chatId, text: 'Сүрөт жүктөлүүдө, күтө туруңуз...' });
            
            const localUrl = await downloadTelegramPhoto(fileId);
            if (localUrl) {
                try {
                    const id = Date.now();
                    const date = new Date().toISOString().split('T')[0];
                    await db.run(
                        "INSERT INTO gallery (id, title, status, url, date) VALUES (?, ?, ?, ?, ?)",
                        [id, title, 'Активдүү', localUrl, date]
                    );
                    userStates[chatId] = { state: 'idle' };
                    await sendMenu(chatId, `✓ Галереяга сүрөт ийгиликтүү кошулду!\n*Аталышы:* ${title}`);
                } catch (err) {
                    await sendMenu(chatId, 'Сүрөттү базага сактоодо ката кетти: ' + err.message);
                }
            } else {
                await sendMenu(chatId, 'Сүрөттү жүктөп алууда ката кетти. Кайрадан аракет кылып көрүңүз.');
            }
        } else {
            await callTelegram('sendMessage', { chat_id: chatId, text: 'Ката: Сүрөт жөнөтүшүңүз керек. (Жокко чыгаруу үчүн /cancel деп жазыңыз)' });
        }
        return;
    }

    // Default commands / buttons
    if (text === '/start') {
        await handleStart(chatId);
    } else if (text === '📊 Статистика') {
        await handleStats(chatId);
    } else if (text === '🔑 Сырсөз өзгөртүү') {
        await handlePasswordPrompt(chatId);
    } else if (text === '🖼️ Галерея') {
        await handleGalleryList(chatId);
    } else if (text === '📁 Долбоорлор') {
        await handleProjectsList(chatId);
    } else if (text === '✉️ Каabarlar (Inbox)' || text === '✉️ Кабарлар (Inbox)') {
        await handleMessagesList(chatId);
    } else {
        await sendMenu(chatId, 'Бул буйрукту түшүнбөдүм. Төмөнкү менюдан бирин тандаңыз:');
    }
}

// Handle callback queries (inline buttons)
async function processCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id.toString();
    const data = callbackQuery.data;
    const queryId = callbackQuery.id;

    if (chatId !== adminChatId) return;

    // Answer callback query to stop loading spinner
    await callTelegram('answerCallbackQuery', { callback_query_id: queryId });

    if (data === 'add_gal') {
        userStates[chatId] = { state: 'add_gal_photo' };
        await callTelegram('sendMessage', {
            chat_id: chatId,
            text: '🖼️ Сураныч, сүрөттү жөнөтүңүз. Сүрөттүн аталышы болушу үчүн ага түшүндүрмө (caption) жазып жөнөтүңүз (болбосо автоматтык түрдө датасы жазылат).'
        });
    } else if (data === 'add_proj') {
        userStates[chatId] = { state: 'add_proj_title' };
        await callTelegram('sendMessage', {
            chat_id: chatId,
            text: '📁 Долбоордун аталышын (title) жазыңыз:'
        });
    } else if (data.startsWith('del_gal_')) {
        const id = data.replace('del_gal_', '');
        try {
            await db.run("DELETE FROM gallery WHERE id = ?", [id]);
            await callTelegram('sendMessage', { chat_id: chatId, text: `✓ Сүрөт өчүрүлдү (ID: ${id})` });
            await handleGalleryList(chatId);
        } catch (err) {
            await callTelegram('sendMessage', { chat_id: chatId, text: 'Өчүрүүдө ката кетти: ' + err.message });
        }
    } else if (data.startsWith('del_proj_')) {
        const id = data.replace('del_proj_', '');
        try {
            await db.run("DELETE FROM projects WHERE id = ?", [id]);
            await callTelegram('sendMessage', { chat_id: chatId, text: `✓ Долбоор өчүрүлдү (ID: ${id})` });
            await handleProjectsList(chatId);
        } catch (err) {
            await callTelegram('sendMessage', { chat_id: chatId, text: 'Өчүрүүдө` ката кетти: ' + err.message });
        }
    } else if (data.startsWith('del_msg_')) {
        const id = data.replace('del_msg_', '');
        try {
            await db.run("DELETE FROM messages WHERE id = ?", [id]);
            await callTelegram('sendMessage', { chat_id: chatId, text: `✓ Кабар өчүрүлдү (ID: ${id})` });
        } catch (err) {
            await callTelegram('sendMessage', { chat_id: chatId, text: 'Өчүрүүдө ката кетти: ' + err.message });
        }
    }
}

// Bot polling mechanism
async function pollUpdates() {
    while (isPolling) {
        if (!botToken) {
            console.log('[Telegram Bot] Bot Token is empty. Waiting...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
        }

        try {
            const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${currentOffset}&timeout=30`;
            abortController = new AbortController();
            const res = await fetch(url, { signal: abortController.signal });
            if (!res.ok) {
                console.error('[Telegram Bot] getUpdates HTTP error:', res.status);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            const data = await res.json();
            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    currentOffset = update.update_id + 1;
                    if (update.message) {
                        await processMessage(update.message);
                    } else if (update.callback_query) {
                        await processCallbackQuery(update.callback_query);
                    }
                }
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('[Telegram Bot] Polling aborted.');
            } else {
                console.error('[Telegram Bot] Polling error:', err.message);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
}

async function startTelegramBot() {
    if (isPolling) return;
    await initCredentials();
    if (!botToken) {
        console.log('[Telegram Bot] Bot is not started: Token not configured in settings.');
        return;
    }
    isPolling = true;
    console.log('[Telegram Bot] Starting long polling bot listener...');
    pollUpdates();
}

function stopTelegramBot() {
    if (!isPolling) return;
    isPolling = false;
    if (abortController) {
        abortController.abort();
    }
    console.log('[Telegram Bot] Polling listener stopped.');
}

async function notifySettingsChanged() {
    console.log('[Telegram Bot] Settings changed! Restarting bot instance...');
    stopTelegramBot();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await startTelegramBot();
}

module.exports = {
    startTelegramBot,
    stopTelegramBot,
    notifySettingsChanged
};
