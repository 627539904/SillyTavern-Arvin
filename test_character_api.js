#!/usr/bin/env node

/**
 * 角色列表API测试脚本
 */

import http from 'http';

function testCharacterAPI() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/character/manage/list',
            method: 'GET',
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
                console.log(`状态码: ${res.statusCode}`);
                console.log(`响应头:`, res.headers);
                console.log(`响应体: ${responseData}`);
                
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
        
        req.end();
    });
}

async function main() {
    console.log('测试角色列表API...');
    console.log('========================================');
    
    try {
        const result = await testCharacterAPI();
        
        if (result.status === 200) {
            console.log('✅ 角色列表API测试成功！');
            console.log('响应数据:', JSON.stringify(result.data, null, 2));
        } else {
            console.log('❌ 角色列表API测试失败');
            console.log(`状态码: ${result.status}`);
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

main(); 