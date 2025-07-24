#!/usr/bin/env node

/**
 * SillyTavern API 测试脚本
 * 用于验证基础API端点是否正常工作
 */

import http from 'http';

function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: `/api${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testAPI() {
    console.log('==================================================');
    console.log('SillyTavern API 基础测试');
    console.log('==================================================');
    console.log();

    try {
        // 测试基础API端点
        console.log('1. 测试基础API端点...');
        const baseResult = await makeRequest('/');
        console.log(`   状态码: ${baseResult.status}`);
        console.log(`   响应: ${JSON.stringify(baseResult.data, null, 2)}`);
        console.log();

        // 测试角色列表端点
        console.log('2. 测试角色列表端点...');
        const charResult = await makeRequest('/character/manage/list');
        console.log(`   状态码: ${charResult.status}`);
        console.log(`   响应: ${JSON.stringify(charResult.data, null, 2)}`);
        console.log();

        // 测试聊天POST端点
        console.log('3. 测试聊天POST端点...');
        const chatData = {
            message: '你好，这是API测试消息',
            character_id: 'char_1'
        };
        const chatResult = await makeRequest('/chat', 'POST', chatData);
        console.log(`   状态码: ${chatResult.status}`);
        console.log(`   响应: ${JSON.stringify(chatResult.data, null, 2)}`);
        console.log();

        if (baseResult.status === 200 && baseResult.data.success && 
            charResult.status === 200 && charResult.data.success &&
            chatResult.status === 200 && chatResult.data.success) {
            console.log('✅ API测试成功！');
            console.log('🎉 第三步完成：基础Post端点已正常工作！');
        } else {
            console.log('❌ API测试失败');
        }

        console.log('==================================================');

    } catch (error) {
        console.error('测试失败:', error.message);
        console.log();
        console.log('可能的原因:');
        console.log('1. SillyTavern服务器未启动');
        console.log('2. 服务器端口不是8000');
        console.log('3. API路由未正确注册');
        console.log('4. 网络连接问题');
    }
}

// 运行测试
testAPI(); 