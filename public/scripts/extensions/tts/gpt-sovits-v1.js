import { saveTtsProviderSettings } from './index.js';

export { GptSovitsV1Provider };

class GptSovitsV1Provider {
    settings;
    ready = false;
    separator = '. ';
    audioElement = document.createElement('audio');

    defaultSettings = {
        provider_endpoint: 'http://localhost:9880',
        text_lang: 'zh',
        prompt_lang: 'zh',
        refer_wav_path: '',
        prompt_text: '',
    };

    get settingsHtml() {
        let html = `
        <label for="tts_endpoint_v1">Provider Endpoint:</label>
        <input id="tts_endpoint_v1" type="text" class="text_pole" maxlength="250" value="${this.settings?.provider_endpoint ?? this.defaultSettings.provider_endpoint}"/>
        <span>Use <a target="_blank" href="https://github.com/RVC-Boss/GPT-SoVITS">GPT-SoVITS V1</a> (Unofficial).</span><br/>
        <label for="refer_wav_path">参考音频路径(refer_wav_path):</label>
        <input id="refer_wav_path" type="text" class="text_pole" maxlength="250" value="${this.settings?.refer_wav_path ?? this.defaultSettings.refer_wav_path}"/><br/>
        <label for="prompt_text">提示文本(prompt_text):</label>
        <input id="prompt_text" type="text" class="text_pole" maxlength="250" value="${this.settings?.prompt_text ?? this.defaultSettings.prompt_text}"/><br/>
        <label for="text_lang_v1">Text Lang(text_language):</label>
        <input id="text_lang_v1" type="text" class="text_pole" maxlength="250" value="${this.settings?.text_lang ?? this.defaultSettings.text_lang}"/><br/>
        <label for="prompt_lang_v1">Prompt Lang(prompt_language):</label>
        <input id="prompt_lang_v1" type="text" class="text_pole" maxlength="250" value="${this.settings?.prompt_lang ?? this.defaultSettings.prompt_lang}"/><br/>
        `;
        return html;
    }

    onSettingsChange() {
        this.settings.provider_endpoint = $('#tts_endpoint_v1').val();
        this.settings.text_lang = $('#text_lang_v1').val();
        this.settings.prompt_lang = $('#prompt_lang_v1').val();
        this.settings.refer_wav_path = $('#refer_wav_path').val();
        this.settings.prompt_text = $('#prompt_text').val();
        saveTtsProviderSettings();
    }

    async loadSettings(settings) {
        if (Object.keys(settings).length == 0) {
            console.info('Using default TTS Provider settings (V1)');
        }
        this.settings = { ...this.defaultSettings };
        for (const key in settings) {
            if (key in this.settings) {
                this.settings[key] = settings[key];
            }
        }
        $('#tts_endpoint_v1').val(this.settings.provider_endpoint);
        $('#text_lang_v1').val(this.settings.text_lang);
        $('#prompt_lang_v1').val(this.settings.prompt_lang);
        $('#refer_wav_path').val(this.settings.refer_wav_path);
        $('#prompt_text').val(this.settings.prompt_text);
        // 自动保存：为所有input添加input事件监听
        $('#tts_endpoint_v1').on('input', () => { this.onSettingsChange(); });
        $('#text_lang_v1').on('input', () => { this.onSettingsChange(); });
        $('#prompt_lang_v1').on('input', () => { this.onSettingsChange(); });
        $('#refer_wav_path').on('input', () => { this.onSettingsChange(); });
        $('#prompt_text').on('input', () => { this.onSettingsChange(); });
        this.ready = true;
        console.info('ITS: V1 Settings loaded');
    }

    async checkReady() {
        // V1无需检测voice ids，直接ready
        this.ready = true;
    }

    async onRefreshClick() {
        // V1无刷新操作
        return;
    }

    async getVoice(voiceName) {
        // V1只支持单一voice，返回包含voice_id字段的对象
        return { name: 'default', voice_id: this.settings.refer_wav_path || 'default' };
    }

    async generateTts(text) {
        console.log('【Debug-TTS】 generateTts called', text, this.settings);
        const url = this.buildV1Url(text);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        return response;
    }

    buildV1Url(text) {
        const base = this.settings.provider_endpoint;
        const params = new URLSearchParams({
            refer_wav_path: this.settings.refer_wav_path,
            prompt_text: this.settings.prompt_text,
            prompt_language: this.settings.prompt_lang,
            text: text,
            text_language: this.settings.text_lang,
        });
        return `${base}?${params.toString()}`;
    }

    async fetchTtsFromHistory(history_item_id) {
        return Promise.resolve(history_item_id);
    }

    async fetchTtsVoiceObjects() {
        // V1不支持voice ids，直接返回空数组
        return [];
    }
} 