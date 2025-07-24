/**
 * 聊天API测试脚本
 * 测试第六步实现的聊天功能
 */

import http from 'http';

// 测试配置
const config = {
    host: '127.0.0.1',
    port: 8000,
    timeout: 5000
};

// HTTP请求辅助函数
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (postData) {
            req.write(JSON.stringify(postData));
        }
        req.end();
    });
}

async function testAPI() {
    console.log('=== 开始测试API端点一致性 ===\n');

    try {
        // 1. 测试基础API端点
        console.log('1. 测试基础API端点 GET /api...');
        const apiResponse = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (apiResponse.status === 200) {
            console.log('✅ 基础API端点正常');
            console.log('响应:', apiResponse.data);
        } else {
            console.log('❌ 基础API端点异常，状态码:', apiResponse.status);
        }

        // 2. 测试原有角色列表端点
        console.log('\n2. 测试原有角色列表端点 GET /api/character/manage/list...');
        const oldCharacterResponse = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/character/manage/list',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (oldCharacterResponse.status === 200) {
            console.log('✅ 原有角色列表端点正常');
            console.log(`找到 ${oldCharacterResponse.data.total || 0} 个角色`);
        } else {
            console.log('❌ 原有角色列表端点异常，状态码:', oldCharacterResponse.status);
        }

        // 3. 测试新角色列表端点
        console.log('\n3. 测试新角色列表端点 GET /api/characters...');
        const newCharacterResponse = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/characters',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (newCharacterResponse.status === 200) {
            console.log('✅ 新角色列表端点正常');
            console.log(`找到 ${newCharacterResponse.data.total || 0} 个角色`);
        } else {
            console.log('❌ 新角色列表端点异常，状态码:', newCharacterResponse.status);
        }

        // 4. 比较两个端点的响应是否一致
        if (oldCharacterResponse.status === 200 && newCharacterResponse.status === 200) {
            const oldData = JSON.stringify(oldCharacterResponse.data);
            const newData = JSON.stringify(newCharacterResponse.data);
            
            if (oldData === newData) {
                console.log('\n✅ 两个角色列表端点返回数据完全一致');
            } else {
                console.log('\n⚠️ 两个角色列表端点返回数据不一致');
                console.log('原有端点数据:', oldCharacterResponse.data);
                console.log('新端点数据:', newCharacterResponse.data);
            }
        }

        // 5. 测试聊天功能
        console.log('\n4. 测试聊天功能 POST /api/chat...');
        
        // 获取第一个角色ID用于测试
        let characterId = 'default_Seraphina'; // 默认角色
        if (oldCharacterResponse.status === 200 && oldCharacterResponse.data.data && oldCharacterResponse.data.data.length > 0) {
            characterId = oldCharacterResponse.data.data[0].id;
        }

        const chatResponse = await makeRequest({
            hostname: config.host,
            port: config.port,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, {
            message: '你好，测试API一致性！',
            character_id: characterId
        });

        if (chatResponse.status === 200) {
            console.log('✅ 聊天功能正常');
            console.log('角色回复:', chatResponse.data.data.character_reply);
        } else {
            console.log('❌ 聊天功能异常，状态码:', chatResponse.status);
            console.log('错误信息:', chatResponse.data);
        }

        console.log('\n=== API端点一致性测试完成 ===');

    } catch (error) {
        console.error('测试过程中发生错误:', error.message);
    }
}

// 运行测试
testAPI(); 