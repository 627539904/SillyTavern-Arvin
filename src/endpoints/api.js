import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { processCharacter } from './characters.js';
import { getUserDirectories } from '../users.js';

const router = express.Router();

/**
 * 基础测试端点
 * GET /api
 */
router.get('/', (request, response) => {
    return response.json({
        success: true,
        message: 'SillyTavern API 已启动',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * 角色列表功能 - 保持原有路径
 * GET /api/character/manage/list
 */
router.get('/character/manage/list', async (request, response) => {
    try {
        console.log('[Debug] API角色列表请求开始');
        
        const directories = getUserDirectories('default-user');
        
        // 读取角色目录中的所有PNG文件
        const files = fs.readdirSync(directories.characters);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        
        console.log(`[Debug] 找到 ${pngFiles.length} 个角色文件`);
        
        // 处理每个角色文件
        const processingPromises = pngFiles.map(async (file) => {
            try {
                const character = await processCharacter(file, directories, { shallow: true });
                return character;
            } catch (error) {
                console.error(`[Debug] 处理角色文件 ${file} 时出错:`, error);
                return null;
            }
        });
        
        const characters = (await Promise.all(processingPromises))
            .filter(c => c && c.name) // 过滤掉无效的角色
            .map(character => ({
                id: character.avatar?.replace('.png', '') || character.name,
                name: character.name,
                avatar: character.avatar,
                description: character.data?.creator_notes || '',
                create_date: character.create_date,
                date_last_chat: character.date_last_chat,
                chat_size: character.chat_size || 0,
                fav: character.fav || false,
                creator: character.data?.creator || '',
                tags: character.data?.tags || []
            }));
        
        console.log(`[Debug] 成功处理 ${characters.length} 个角色`);
        
        return response.json({
            success: true,
            data: characters,
            total: characters.length
        });

    } catch (error) {
        console.error('[Debug] API角色列表错误:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * 角色列表功能 - 新路径（向后兼容）
 * GET /api/characters
 */
router.get('/characters', async (request, response) => {
    try {
        console.log('[Debug] API角色列表请求开始（新路径）');
        
        const directories = getUserDirectories('default-user');
        
        // 读取角色目录中的所有PNG文件
        const files = fs.readdirSync(directories.characters);
        const pngFiles = files.filter(file => file.endsWith('.png'));
        
        console.log(`[Debug] 找到 ${pngFiles.length} 个角色文件`);
        
        // 处理每个角色文件
        const processingPromises = pngFiles.map(async (file) => {
            try {
                const character = await processCharacter(file, directories, { shallow: true });
                return character;
            } catch (error) {
                console.error(`[Debug] 处理角色文件 ${file} 时出错:`, error);
                return null;
            }
        });
        
        const characters = (await Promise.all(processingPromises))
            .filter(c => c && c.name) // 过滤掉无效的角色
            .map(character => ({
                id: character.avatar?.replace('.png', '') || character.name,
                name: character.name,
                avatar: character.avatar,
                description: character.data?.creator_notes || '',
                create_date: character.create_date,
                date_last_chat: character.date_last_chat,
                chat_size: character.chat_size || 0,
                fav: character.fav || false,
                creator: character.data?.creator || '',
                tags: character.data?.tags || []
            }));
        
        console.log(`[Debug] 成功处理 ${characters.length} 个角色`);
        
        return response.json({
            success: true,
            data: characters,
            total: characters.length
        });

    } catch (error) {
        console.error('[Debug] API角色列表错误:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * 聊天功能 - 发送消息并获取回复
 * POST /api/chat
 */
router.post('/chat', async (request, response) => {
    try {
        const { message, character_id, chat_history = [] } = request.body;

        console.log(`[Debug] API聊天请求 - 消息: ${message?.substring(0, 50)}..., 角色: ${character_id}`);

        // 验证必需参数
        if (!message) {
            return response.status(400).json({
                error: 'Bad Request',
                message: 'message is required'
            });
        }

        if (!character_id) {
            return response.status(400).json({
                error: 'Bad Request',
                message: 'character_id is required'
            });
        }

        // 获取角色信息
        const directories = getUserDirectories('default-user');
        const characterFile = `${character_id}.png`;
        const characterPath = path.join(directories.characters, characterFile);
        
        if (!fs.existsSync(characterPath)) {
            return response.status(404).json({
                error: 'Not Found',
                message: 'Character not found'
            });
        }

        const character = await processCharacter(characterFile, directories, { shallow: false });
        
        if (!character) {
            return response.status(404).json({
                error: 'Not Found',
                message: 'Failed to load character data'
            });
        }

        console.log(`[Debug] 加载角色: ${character.name}`);

        // 构建聊天消息
        const messages = [];
        
        // 添加系统提示词（如果存在）
        if (character.data?.system_prompt) {
            messages.push({
                role: 'system',
                content: character.data.system_prompt
            });
        }

        // 添加角色描述和个性
        const characterContext = [];
        if (character.description) {
            characterContext.push(`描述: ${character.description}`);
        }
        if (character.personality) {
            characterContext.push(`个性: ${character.personality}`);
        }
        if (character.scenario) {
            characterContext.push(`场景: ${character.scenario}`);
        }
        
        if (characterContext.length > 0) {
            messages.push({
                role: 'system',
                content: characterContext.join('\n')
            });
        }

        // 添加聊天历史
        if (Array.isArray(chat_history) && chat_history.length > 0) {
            for (const historyItem of chat_history) {
                if (historyItem.role && historyItem.content) {
                    messages.push({
                        role: historyItem.role,
                        content: historyItem.content
                    });
                }
            }
        }

        // 添加用户当前消息
        messages.push({
            role: 'user',
            content: message
        });

        console.log(`[Debug] 构建聊天消息完成，共 ${messages.length} 条消息`);

        // 调用聊天生成API
        const generateData = {
            messages: messages,
            model: 'gpt-3.5-turbo', // 默认模型，可以从配置中获取
            temperature: 0.7,
            max_tokens: 1000,
            stream: false,
            chat_completion_source: 'openai', // 默认使用OpenAI
            user_name: 'User',
            char_name: character.name
        };

        console.log(`[Debug] 发送聊天生成请求`);
        
        // 这里需要调用SillyTavern的聊天生成系统
        // 由于这是一个简化的API实现，我们使用模拟回复
        // 在实际实现中，应该调用 /api/backends/chat-completions/generate
        
        // 模拟AI回复
        const characterReply = generateCharacterReply(character, message, chat_history);
        
        const result = {
            message_id: Date.now().toString(),
            character_id: character_id,
            character_name: character.name,
            user_message: message,
            character_reply: characterReply,
            timestamp: new Date().toISOString(),
            chat_history: [
                ...messages,
                {
                    role: 'assistant',
                    content: characterReply
                }
            ]
        };
        
        console.log(`[Debug] 聊天回复生成完成`);
        
        return response.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('[Debug] API聊天错误:', error);
        return response.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

/**
 * 生成角色回复的辅助函数
 * @param {Object} character 角色信息
 * @param {string} userMessage 用户消息
 * @param {Array} chatHistory 聊天历史
 * @returns {string} 角色回复
 */
function generateCharacterReply(character, userMessage, chatHistory) {
    // 这是一个简化的回复生成逻辑
    // 在实际实现中，应该调用真实的AI模型
    
    const replies = [
        `我理解你说的"${userMessage}"，让我想想...`,
        `关于"${userMessage}"，我觉得很有趣。`,
        `你说得对，"${userMessage}"确实值得思考。`,
        `嗯，关于"${userMessage}"，我有一些想法...`,
        `"${userMessage}"让我想起了...`,
    ];
    
    // 根据角色个性调整回复风格
    let reply = replies[Math.floor(Math.random() * replies.length)];
    
    if (character.personality && character.personality.includes('友好')) {
        reply = `很高兴和你聊天！${reply}`;
    } else if (character.personality && character.personality.includes('神秘')) {
        reply = `*神秘地笑了笑* ${reply}`;
    }
    
    return reply;
}

export { router }; 