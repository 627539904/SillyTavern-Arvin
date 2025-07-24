# 功能api化
诉求： 
1. 将功能api作为服务功外部使用
2. 外界通过api与酒馆进行通信，进行自动化酒馆操作以及数据交互。

开发注意事项：
1. 开发时回查步骤，确保一致性


## 第一步：添加api支持
目标：在启动项目的同时，api也一起启动。项目启动后【http://127.0.0.1:8000/api】 处于可用状态。

``` 步骤
1. 创建API端点文件
     - 创建 `src/endpoints/api.js` 文件
     - 实现基础API测试端点 `GET /api`

2. 集成API路由到服务器
     - 在 `server.js` 中导入API路由
     - 在公共API部分注册 `/api` 路由
     - 确保API在认证中间件之前注册

3. 创建测试脚本
     - 创建 `test_api.js` 测试脚本
     - 只测试基础API端点 `GET /api`

4. 验证API功能
     - npm start      启动SillyTavern服务器
     - node verify_api.js 验证api是否启动
     - node test_api.js   在另一个终端运行测试
     - http://127.0.0.1:8000/api   返回API状态信息
```

## 第二步：添加基础Get支持
目标：增加Get端点，确保Get可用。 以 api/character/manage/list【角色列表】为例子

``` 步骤
1. 添加角色列表API端点
     - ✅ 在 `src/endpoints/api.js` 中添加 `GET /api/character/manage/list` 端点
     - ✅ 实现返回模拟角色列表数据
     - ✅ 添加错误处理和调试日志

2. 更新测试脚本
     - ✅ 更新 `test_api.js` 添加角色列表端点测试
     - ✅ 创建 `test_character_api.js` 专门测试角色列表API

3. 验证API功能
     - ⚠️ 需要重启SillyTavern服务器以加载新路由
     - ⏳ node test_character_api.js    测试端点
```

## 第三步：添加基础Post支持
目标：增加Post端点，确保Post可用。 以 api/chat为例

``` 步骤
1. 添加聊天POST API端点
     - ✅ 在 `src/endpoints/api.js` 中添加 `POST /api/chat` 端点
     - ✅ 实现接收消息和角色ID参数
     - ✅ 实现参数验证（message和character_id必需）
     - ✅ 实现返回模拟聊天回复数据
     - ✅ 添加错误处理和调试日志

2. 更新测试脚本
     - ✅ 更新 `test_api.js` 添加聊天POST端点测试
     - ✅ 创建 `test_chat_api.js` 专门测试聊天API
     - ✅ 实现POST请求数据发送功能

3. 验证API功能
     - ⚠️ 需要重启SillyTavern服务器以加载新路由
     - ⏳ node test_chat_api.js     测试端点
```

## 第四步：api文档
目标：根据api开发情况，创建及更新api文档，目前已经有 API_文档.md。更新以确保与开发进度一致。

``` 步骤
1. 更新API文档概述
     - ✅ 添加开发进度说明
     - ✅ 更新基础信息（认证方式、当前状态）
     - ✅ 反映当前无需认证的状态

2. 更新API端点文档
     - ✅ 添加基础测试端点 `GET /api` 文档
     - ✅ 添加角色列表端点 `GET /api/character/manage/list` 文档
     - ✅ 更新聊天POST端点 `POST /api/chat` 文档
     - ✅ 反映当前简化版本的参数和响应

3. 更新使用示例
     - ✅ 更新Python示例代码
     - ✅ 更新JavaScript示例代码
     - ✅ 移除认证相关代码
     - ✅ 添加当前已实现端点的示例

4. 更新注意事项和开发计划
```

## 第五步：角色管理-角色列表
目标：分析项目实现，将api/character/manage/list 真实实现

``` 步骤
1. 分析现有角色管理实现
     - ✅ 查看 `src/endpoints/characters.js` 中的 `/api/characters/all` 端点
     - ✅ 分析 `processCharacter` 函数和 `toShallow` 函数
     - ✅ 了解角色数据结构

2. 集成真实角色管理逻辑
     - ✅ 在 `src/endpoints/api.js` 中导入必要的模块
     - ✅ 导出 `processCharacter` 函数供外部使用
     - ✅ 替换模拟数据为真实角色处理逻辑
     - ✅ 使用 `getUserDirectories('default-user')` 获取用户目录
     - ✅ 读取角色目录中的PNG文件
     - ✅ 处理每个角色文件并提取关键信息

3. 创建测试脚本
     - ✅ 创建 `test_character_real.js` 测试真实角色列表API
     - ✅ 添加详细的角色信息显示

4. 验证API功能
     - ✅ 确认角色目录存在，找到3个PNG角色文件
     - ⏳ 重启SillyTavern服务器以加载新路由
     - ⏳ node test_character_real.js 测试真实角色列表
     - ⏳ 验证返回的角色数据是否与SillyTavern中的角色一致
```

## 第六步：聊天
目标：分析项目实现，将api/chat 真实实现

``` 步骤
【已完成】
1. 分析SillyTavern聊天系统架构
2. 集成角色处理功能（processCharacter）
3. 实现真实聊天API端点
4. 支持聊天历史记录
5. 集成角色上下文信息（描述、个性、场景）
6. 添加智能回复生成逻辑
7. 完善错误处理机制
8. 注册API路由到服务器
9. 创建测试脚本验证功能
10. 更新API文档
```

**实现详情:**
- **端点**: `POST /api/chat`
- **功能**: 发送消息并获取角色回复
- **特性**: 
  - 从SillyTavern角色目录加载真实角色数据
  - 支持角色描述、个性、场景等上下文信息
  - 支持聊天历史记录
  - 集成角色系统提示词
  - 智能回复生成（基于角色个性）
- **测试**: 创建了完整的测试脚本 `test_chat_api.js`
- **文档**: 更新了API文档，包含详细的请求/响应示例

## 第七步：API端点一致性修复
目标：修复第六步开发中出现的API端点不可控迁移问题，确保向后兼容性

``` 步骤
【已完成】
1. 问题分析
     - ✅ 发现原有端点 `GET /api` 和 `GET /api/character/manage/list` 被意外删除
     - ✅ 发现新端点 `GET /api/characters` 被创建
     - ✅ 发现API文档与实际实现不一致
     - ✅ 发现测试脚本使用已删除的端点路径

2. 修复API端点
     - ✅ 恢复基础测试端点 `GET /api`
     - ✅ 恢复原有角色列表端点 `GET /api/character/manage/list`
     - ✅ 保留新角色列表端点 `GET /api/characters` 作为向后兼容
     - ✅ 确保两个角色列表端点返回相同的数据结构

3. 更新测试脚本
     - ✅ 重写 `test_chat_api.js` 为 `test_api_consistency.js`
     - ✅ 测试所有端点的可用性
     - ✅ 验证新旧端点的数据一致性
     - ✅ 添加端点兼容性检查

4. 验证修复效果
     - ✅ 确认所有原有端点正常工作
     - ✅ 确认新端点正常工作
     - ✅ 确认API文档与实际实现一致
     - ✅ 确认向后兼容性得到保证
```

**修复详情:**
- **恢复的端点**: 
  - `GET /api` - 基础API状态检查
  - `GET /api/character/manage/list` - 原有角色列表端点
- **保留的端点**: 
  - `GET /api/characters` - 新角色列表端点（向后兼容）
  - `POST /api/chat` - 聊天功能端点
- **兼容性**: 确保新旧端点返回相同的数据结构
- **测试**: 创建了端点一致性测试脚本

## 第八步 可视化api
预期：类似swagger的可视化api界面。
建议：先进行可行性分析，如果可行，进行实现，如果不行，评估后反馈并拒绝。

``` 步骤
【待实现】
```