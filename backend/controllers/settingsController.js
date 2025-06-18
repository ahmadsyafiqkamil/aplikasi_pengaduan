const { AppConfig } = require('../models');

const getSettings = async (req, res) => {
    try {
        const settings = await AppConfig.findAll({
            where: { is_public: true }
        });
        
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch settings' 
        });
    }
};

const saveSetting = async (req, res) => {
    try {
        const { key, value, description, category } = req.body;
        
        const [setting, created] = await AppConfig.upsert({ 
            key, 
            value, 
            description,
            category: category || 'system'
        });
        
        res.json({ 
            success: true,
            message: created ? 'Setting created' : 'Setting updated',
            data: setting
        });
    } catch (error) {
        console.error('Save setting error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to save setting' 
        });
    }
};

const getAppConfig = async (req, res) => {
    try {
        const config = await AppConfig.findOne({
            where: { key: 'app_content_config' }
        });
        
        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'App configuration not found'
            });
        }
        
        res.json({
            success: true,
            data: config.value
        });
    } catch (error) {
        console.error('Get app config error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch app configuration' 
        });
    }
};

const updateAppConfig = async (req, res) => {
    try {
        const configData = req.body;
        
        const [config, created] = await AppConfig.upsert({
            key: 'app_content_config',
            value: configData,
            description: 'Application content configuration',
            category: 'content',
            is_public: true
        });
        
        res.json({
            success: true,
            message: created ? 'Configuration created' : 'Configuration updated',
            data: config.value
        });
    } catch (error) {
        console.error('Update app config error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to update app configuration' 
        });
    }
};

module.exports = { 
    getSettings, 
    saveSetting, 
    getAppConfig, 
    updateAppConfig 
};
