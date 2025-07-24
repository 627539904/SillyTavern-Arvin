#!/usr/bin/env node

/**
 * 真实角色列表API测试脚本
 */

import http from 'http';

function testCharacterRealAPI() {
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
                console.log('==================================================');
                console.log('真实角色列表API测试');
                console.log('==================================================');
                console.log(`状态码: ${res.statusCode}`);
                console.log(`响应头:`, res.headers);
                console.log();
                
                try {
                    const jsonData = JSON.parse(responseData);
                    console.log('响应数据:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    
                    if (jsonData.success) {
                        console.log();
                        console.log('✅ API调用成功');
                        console.log(`📊 角色总数: ${jsonData.total}`);
                        
                        if (jsonData.data && jsonData.data.length > 0) {
                            console.log();
                            console.log('📋 角色列表:');
                            jsonData.data.forEach((char, index) => {
                                console.log(`  ${index + 1}. ${char.name} (${char.avatar})`);
                                console.log(`     创建时间: ${char.create_date}`);
                                console.log(`     最后聊天: ${char.date_last_chat || '无'}`);
                                console.log(`     聊天大小: ${char.chat_size} bytes`);
                                console.log(`     收藏: ${char.fav ? '是' : '否'}`);
                                if (char.creator) {
                                    console.log(`     创建者: ${char.creator}`);
                                }
                                if (char.tags && char.tags.length > 0) {
                                    console.log(`     标签: ${char.tags.join(', ')}`);
                                }
                                console.log();
                            });
                        } else {
                            console.log('⚠️  没有找到角色文件');
                        }
                    } else {
                        console.log('❌ API调用失败');
                        console.log(`错误: ${jsonData.error || '未知错误'}`);
                    }
                    
                    resolve({
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    console.log('❌ 响应解析失败');
                    console.log(`原始响应: ${responseData}`);
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
                
                console.log('==================================================');
            });
        });

        req.on('error', (error) => {
            console.error('❌ 请求失败:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

async function main() {
    try {
        await testCharacterRealAPI();
    } catch (error) {
        console.error('测试失败:', error);
    }
}

main(); 