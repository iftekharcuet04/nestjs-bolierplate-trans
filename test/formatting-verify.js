const { TranslationService } = require('../src/common/translation.service');
const { ResponseFormatInterceptor } = require('../src/common/interceptors/response.interceptor');

async function verify() {
    console.log('Testing Translation & Response Formatter...');

    const translationService = new TranslationService();
    translationService.onModuleInit();

    const translatedEn = translationService.translate('SUCCESS', 'en');
    console.log(`  [Translation EN] 'SUCCESS' -> '${translatedEn}'`);

    const interceptor = new ResponseFormatInterceptor(translationService);
    
    const data = { message: 'TEST_MSG', result: 'DATA' };
    const status = 200;
    const language = 'en';

    const messageKey = data.message || 'SUCCESS';
    const translatedMessage = translationService.translate(messageKey, language);

    const formattedResponse = {
        success: true,
        responseCode: status,
        message: translatedMessage || messageKey,
        data: { result: 'DATA' },
        timestamp: new Date().toISOString(),
    };

    console.log('--- Formatted Response ---');
    console.log(JSON.stringify(formattedResponse, null, 2));

    if (formattedResponse.success && formattedResponse.responseCode === 200) {
        console.log('Verification: Passed.');
    } else {
        console.log('Verification: Failed.');
    }
}

verify().catch(console.error);
