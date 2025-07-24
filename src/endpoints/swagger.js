import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiSpec } from './api-decorators.js';

const router = express.Router();

// Swagger UI配置
const options = {
    explorer: true,
    customSiteTitle: 'SillyTavern API - 自动生成文档',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
    }
};

// 路由设置
router.get('/swagger.json', (req, res) => {
    // 动态生成OpenAPI规范
    const openApiSpec = generateOpenApiSpec('/api/v2');
    res.json(openApiSpec);
});

router.get('/swagger.yaml', async (req, res) => {
    // 动态生成OpenAPI规范（YAML格式）
    const openApiSpec = generateOpenApiSpec('/api/v2');
    const { dump } = await import('js-yaml');
    res.setHeader('Content-Type', 'text/yaml');
    res.send(dump(openApiSpec));
});

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(generateOpenApiSpec('/api/v2'), options));

export { router as swaggerRouter }; 