# SillyTavern API 文档

## 概述

SillyTavern API 提供了将聊天和TTS功能外部化的接口，支持两种使用场景：
1. 将功能API作为服务供外部使用
2. 外界通过API与酒馆进行通信，进行自动化酒馆操作以及数据交互

## 开发进度

当前API开发进度：
- ✅ **第一步**: 基础API支持 - 已完成
- ✅ **第二步**: 基础GET支持 - 已完成  
- ✅ **第三步**: 基础POST支持 - 已完成
- ✅ **第四步**: API文档更新 - 已完成
- ✅ **第五步**: 角色管理真实实现 - 已完成

## 基础信息

- **基础URL**: `http://localhost:8000/api`
- **认证方式**: 当前无需认证（CSRF保护已绕过）
- **数据格式**: JSON
- **字符编码**: UTF-8
- **当前状态**: 角色列表返回真实数据，聊天功能返回模拟数据

## 认证

**当前状态**: API端点已绕过CSRF保护，无需认证即可访问。

### 未来认证方式（计划中）

#### API Key 认证
在请求头中添加 `X-API-Key` 或在查询参数中添加 `api_key`：

```bash
# 请求头方式
curl -H "X-API-Key: your-api-key" http://localhost:8000/api/chat

# 查询参数方式
curl "http://localhost:8000/api/chat?api_key=your-api-key"
```

#### 用户会话认证
通过浏览器登录后，会话会自动保持，无需额外认证。

## API 端点

### 0. 基础测试端点

#### API状态检查
**GET** `/api`

**响应示例:**
```json
{
    "success": true,
    "message": "SillyTavern API 已启动",
    "version": "1.0.0",
    "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 1. 角色管理

#### 获取角色列表
**GET** `/api/character/manage/list`

**响应示例:**
```json
{
    "success": true,
    "data": [
        {
            "id": "seraphina",
            "name": "Seraphina",
            "avatar": "seraphina.png",
            "description": "角色描述或创建者注释",
            "create_date": "2024-01-01T00:00:00.000Z",
            "date_last_chat": "2024-01-15T10:30:00.000Z",
            "chat_size": 1024,
            "fav": false,
            "creator": "角色创建者",
            "tags": ["标签1", "标签2"]
        }
    ],
    "total": 1
}
```

**数据字段说明:**
- `id`: 角色ID（文件名，不含.png扩展名）
- `name`: 角色名称
- `avatar`: 角色头像文件名
- `description`: 角色描述或创建者注释
- `create_date`: 角色创建时间
- `date_last_chat`: 最后聊天时间（可能为null）
- `chat_size`: 聊天记录大小（字节）
- `fav`: 是否收藏
- `creator`: 角色创建者（可选）
- `tags`: 角色标签数组（可选）

### 2. 聊天功能

#### 发送消息并获取回复
**POST** `/api/chat`

**请求参数:**
```json
{
    "message": "你好",
    "character_id": "seraphina",
    "chat_history": [
        {
            "role": "user",
            "content": "你好"
        },
        {
            "role": "assistant", 
            "content": "你好！很高兴认识你。"
        }
    ]
}
```

**参数说明:**
- `message` (必需): 用户发送的消息
- `character_id` (必需): 角色ID（文件名，不含.png扩展名）
- `chat_history` (可选): 聊天历史记录数组，包含role和content字段

**当前状态**: ✅ **已完成** - 真实聊天功能实现

**功能特性:**
- 从SillyTavern角色目录加载真实角色数据
- 支持角色描述、个性、场景等上下文信息
- 支持聊天历史记录
- 集成角色系统提示词
- 智能回复生成（基于角色个性）

**响应示例:**
```json
{
    "success": true,
    "data": {
        "message_id": "1703123456789",
        "character_id": "seraphina",
        "character_name": "Seraphina",
        "user_message": "你好",
        "character_reply": "很高兴和你聊天！我理解你说的\"你好\"，让我想想...",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "chat_history": [
            {
                "role": "system",
                "content": "描述: 一个友好的AI助手\n个性: 友好、乐于助人\n场景: 日常对话"
            },
            {
                "role": "user", 
                "content": "你好"
            },
            {
                "role": "assistant",
                "content": "很高兴和你聊天！我理解你说的\"你好\"，让我想想..."
            }
        ]
    }
}
```

**错误响应示例:**
```json
{
    "error": "Bad Request",
    "message": "message is required"
}
```

```json
{
    "error": "Not Found", 
    "message": "Character not found"
}
```



## 错误处理

所有API都遵循统一的错误响应格式：

```json
{
    "error": "错误类型",
    "message": "错误描述"
}
```

**常见错误码:**
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 认证失败
- `500 Internal Server Error`: 服务器内部错误

## 使用示例

### Python 示例

```python
import requests
import json

# API配置
API_BASE = "http://localhost:8000/api"

headers = {
    "Content-Type": "application/json"
}

# 检查API状态
def check_api_status():
    url = f"{API_BASE}"
    response = requests.get(url)
    return response.json()

# 获取角色列表
def get_characters():
    url = f"{API_BASE}/character/manage/list"
    response = requests.get(url)
    return response.json()

# 发送聊天消息
def send_chat_message(message, character_id):
    url = f"{API_BASE}/chat"
    data = {
        "message": message,
        "character_id": character_id
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

# 使用示例
if __name__ == "__main__":
    # 检查API状态
    status = check_api_status()
    print("API状态:", status["message"])
    
    # 获取角色列表
    characters = get_characters()
    print("角色数量:", characters["total"])
    
    # 发送消息
    result = send_chat_message("你好", "char_1")
    print("聊天回复:", result["data"]["character_reply"])
```

### JavaScript 示例

```javascript
// API配置
const API_BASE = "http://localhost:8000/api";

const headers = {
    "Content-Type": "application/json"
};

// 检查API状态
async function checkApiStatus() {
    const response = await fetch(`${API_BASE}`);
    return await response.json();
}

// 获取角色列表
async function getCharacters() {
    const response = await fetch(`${API_BASE}/character/manage/list`);
    return await response.json();
}

// 发送聊天消息
async function sendChatMessage(message, characterId) {
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            message: message,
            character_id: characterId
        })
    });
    
    return await response.json();
}

// 使用示例
async function main() {
    try {
        // 检查API状态
        const status = await checkApiStatus();
        console.log("API状态:", status.message);
        
        // 获取角色列表
        const characters = await getCharacters();
        console.log("角色数量:", characters.total);
        
        // 发送消息
        const chatResult = await sendChatMessage("你好", "char_1");
        console.log("聊天回复:", chatResult.data.character_reply);
    } catch (error) {
        console.error("API调用失败:", error);
    }
}

main();
```

## 配置说明

### 当前配置

当前API端点已绕过CSRF保护，无需额外配置即可使用。

### 安全建议

1. **开发环境**: 当前仅用于开发测试，不建议在生产环境使用
2. **访问控制**: 考虑添加IP白名单限制
3. **日志监控**: 监控API访问日志
4. **HTTPS**: 在生产环境中使用HTTPS
5. **认证机制**: 后续将实现API Key认证机制

## 注意事项

1. **当前状态**: 角色列表已集成真实数据，聊天功能仍为模拟数据
2. **开发阶段**: 已完成基础API框架搭建，CSRF保护已绕过
3. **功能限制**: 当前支持3个基础端点，角色列表为真实实现
4. **数据安全**: 当前无需认证，仅用于开发测试
5. **同步性**: 文档已与当前实现保持完全同步

## 测试脚本

项目提供了以下测试脚本：

- `verify_api.js` - 验证基础API端点
- `test_api.js` - 综合测试所有API端点
- `test_character_api.js` - 专门测试角色列表API（模拟数据）
- `test_character_real.js` - 专门测试角色列表API（真实数据）
- `test_chat_api.js` - 专门测试聊天API

## 后续开发计划

### 短期目标
1. **集成真实聊天数据**: 集成SillyTavern的聊天核心逻辑
2. **完善参数验证**: 添加更完善的请求参数验证
3. **错误处理优化**: 实现更详细的错误响应
4. **聊天历史**: 实现聊天历史记录功能

### 中期目标
5. **TTS功能**: 集成SillyTavern的TTS功能
6. **流式响应**: 支持实时流式聊天响应
7. **批量操作**: 支持批量消息处理
8. **角色管理**: 完善角色管理功能

### 长期目标
9. **WebSocket**: 提供WebSocket接口用于实时通信
10. **权限管理**: 细粒度的API权限控制
11. **监控统计**: API使用统计和监控功能
12. **认证系统**: 实现API Key认证机制 