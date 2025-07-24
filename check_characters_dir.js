#!/usr/bin/env node

/**
 * 检查角色目录和文件的脚本
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { getUserDirectories } from './src/users.js';

function checkCharactersDirectory() {
    console.log('==================================================');
    console.log('角色目录检查');
    console.log('==================================================');
    
    try {
        // 读取配置文件获取dataRoot
        let dataRoot = './data';
        if (fs.existsSync('./config.yaml')) {
            const config = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'));
            dataRoot = config.dataRoot || './data';
        }
        
        // 设置全局DATA_ROOT变量
        globalThis.DATA_ROOT = dataRoot;
        
        console.log('数据根目录:', dataRoot);
        
        // 获取默认用户的目录
        const directories = getUserDirectories('default-user');
        console.log('用户目录根路径:', directories.root);
        console.log('角色目录路径:', directories.characters);
        console.log();
        
        // 检查角色目录是否存在
        if (!fs.existsSync(directories.characters)) {
            console.log('❌ 角色目录不存在');
            console.log('请确保SillyTavern已正确安装并运行过');
            return;
        }
        
        console.log('✅ 角色目录存在');
        
        // 读取角色目录中的文件
        const files = fs.readdirSync(directories.characters);
        console.log(`📁 目录中共有 ${files.length} 个文件/文件夹`);
        
        // 过滤PNG文件
        const pngFiles = files.filter(file => file.endsWith('.png'));
        console.log(`🖼️  其中PNG文件 ${pngFiles.length} 个`);
        
        if (pngFiles.length > 0) {
            console.log();
            console.log('📋 PNG文件列表:');
            pngFiles.forEach((file, index) => {
                const filePath = path.join(directories.characters, file);
                const stats = fs.statSync(filePath);
                const sizeKB = (stats.size / 1024).toFixed(2);
                console.log(`  ${index + 1}. ${file} (${sizeKB} KB)`);
            });
        } else {
            console.log('⚠️  没有找到PNG角色文件');
            console.log('请确保角色文件已正确放置在角色目录中');
        }
        
        console.log();
        console.log('==================================================');
        
    } catch (error) {
        console.error('❌ 检查失败:', error.message);
        console.log('==================================================');
    }
}

checkCharactersDirectory(); 