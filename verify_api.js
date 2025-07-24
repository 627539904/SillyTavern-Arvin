#!/usr/bin/env node

/**
 * API验证脚本
 * 简单验证API是否正常启动
 */

import http from 'http';

function checkAPI() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api',
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        success: true,
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        status: res.statusCode,
                        data: data,
                        error: 'JSON解析失败'
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                success: false,
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({
                success: false,
                error: '请求超时'
            });
        });

        req.end();
    });
}

async function main() {
    console.log('验证SillyTavern API...');
    console.log('========================================');
    
    try {
        const result = await checkAPI();
        
        if (result.success) {
            console.log('✅ API验证成功！');
            console.log(`状态码: ${result.status}`);
            console.log('响应数据:');
            console.log(JSON.stringify(result.data, null, 2));
            console.log();
            console.log('🎉 第一步完成：API已成功启动！');
            console.log('现在可以访问: http://127.0.0.1:8000/api');
        } else {
            console.log('❌ API验证失败');
            console.log(`状态码: ${result.status}`);
            console.log(`错误: ${result.error}`);
            console.log(`响应: ${result.data}`);
        }
        
    } catch (error) {
        console.log('❌ API连接失败');
        console.log(`错误: ${error.error}`);
        console.log();
        console.log('请检查:');
        console.log('1. SillyTavern服务器是否已启动');
        console.log('2. 服务器是否在端口8000上运行');
        console.log('3. 网络连接是否正常');
    }
}

main(); 