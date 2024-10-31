/**
                     * 设置多语言间的不翻译词
                     * @param {string[]} languages - 支持的语言数组
                     * @param {string[]} noTranslateWords - 不需要翻译的词数组
                     */
function setupNoTranslateWords(languages, noTranslateWords) {
    // 遍历所有可能的语言对组合
    for (let i = 0; i < languages.length; i++) {
        for (let j = 0; j < languages.length; j++) {
            if (i !== j) { // 跳过相同语言
                const fromLang = languages[i];
                const toLang = languages[j];
                
                // 为每个不翻译词创建映射
                const noTranslateMapping = noTranslateWords.map(word => `${word}=${word}`).join('\n');
                
                // 设置不翻译规则
                translate.nomenclature.append(fromLang, toLang, `
                    ${noTranslateMapping}
                `);
            }
        }
    }
}
const language = ['english', 'chinese_simplified', 'russian', 'japanese']
const noTranslate = ['neuxserver', 'Neuxserver', 'benchmark', 'benchmarks', 'Benchmarks', 'GPU']
setupNoTranslateWords(language, noTranslate)

// 不出现的select的选择语言
translate.selectLanguageTag.show = false;
// translate.language.setLocal("english"); // 设置本地语种（当前网页的语种）。如果不设置，默认自动识别当前网页显示文字的语种。 可填写如 'english'、'chinese_simplified' 等，具体参见文档下方关于此的说明。
translate.service.use("client.edge"); // 设置机器翻译服务通道，直接客户端本身，不依赖服务端 。相关说明参考 http://translate.zvo.cn/43086.html

translate.execute(); // 进行翻译