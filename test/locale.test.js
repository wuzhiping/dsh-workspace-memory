import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const localeDir = new URL('../locale/', import.meta.url)

/** @param {string} name */
function read(name) {
  return JSON.parse(readFileSync(new URL(name, localeDir), 'utf8'))
}

/** @param {object} dictionary */
function keys(dictionary) {
  return Object.keys(dictionary).filter((key) => key !== 'meta').sort()
}

test('every locale dictionary carries the same key set', () => {
  const en = read('en.json')
  const zh = read('zh.json')
  const zhTW = read('zh-TW.json')

  assert.deepEqual(keys(zh), keys(en), 'zh.json must cover every en.json key')
  assert.deepEqual(keys(zhTW), keys(en), 'zh-TW.json must cover every en.json key')
  assert.deepEqual(Object.keys(zh.meta).sort(), Object.keys(en.meta).sort())
  assert.deepEqual(Object.keys(zhTW.meta).sort(), Object.keys(en.meta).sort())
})

test('the Traditional Chinese copy carries no Simplified forms', () => {
  const zhTW = JSON.stringify(read('zh-TW.json'))

  // Simplified forms whose Traditional counterpart differs. Characters that are
  // identical in both scripts are deliberately absent: they are not evidence of
  // a Simplified string.
  const simplifiedOnly = [
    '记', '忆', '请', '这', '们', '个', '说', '话', '时', '开', '关', '网', '页',
    '载', '设', '钮', '样', '边', '该', '复', '选', '项', '确', '认', '软', '对',
    '压', '缩', '简', '笔', '储', '径', '调', '试', '无', '状', '态', '检', '败',
    '准', '备', '来', '输', '阶', '层', '标', '题', '杂', '宝', '删', '数', '据',
    '报', '络', '优', '质', '动', '觉', '为', '从', '会', '义', '产', '业', '务',
    '员', '团', '队', '图', '号', '库', '厂', '历', '变', '参', '双', '发', '叙',
    '吗', '启', '围', '场', '坏', '块', '坚', '声', '处', '够', '头', '夹', '夺',
    '奖', '妇', '娱', '宁', '宫', '导', '寻', '尘', '尽', '岁', '岗', '岛', '币',
    '师', '帐', '带', '帮', '广', '庆', '应', '废', '异', '张', '弹', '归', '当',
    '录', '恶', '惊', '惧', '战', '户', '扑', '执', '扩', '扫', '扬', '换', '据',
    '损', '挥', '择', '挂', '摊', '敌', '断', '术', '机', '权', '条', '极', '构',
    '楼', '树', '桥', '欧', '气', '汉', '汤', '没', '沟', '泪', '洁', '济', '浅',
    '测', '浏', '涂', '润', '涨', '渐', '温', '满', '滚', '滤', '灭', '灯', '灵',
    '灾', '炉', '独', '现', '环', '画', '疗', '监', '盘', '睁', '瞒', '矫', '码',
    '础', '礼', '祸', '离', '种', '积', '称', '稳', '穷', '窃', '竞', '筑', '签',
    '篮', '粮', '紧', '纠', '红', '纤', '级', '纪', '纯', '纲', '纳', '纵', '纷',
    '纸', '纹', '纺', '线', '练', '组', '细', '织', '终', '绍', '经', '结', '绕',
    '绘', '给', '绝', '统', '继', '续', '维', '综', '编', '缘', '羡', '耀', '职',
    '联', '聪', '肃', '肠', '肤', '肾', '肿', '胀', '胁', '胆', '胜', '脏', '脑',
    '脚', '脱', '腊', '腾', '舰', '艰', '节', '芦', '苏', '苹', '药', '荐', '荣',
    '莱', '获', '营', '萧', '蓝', '虏', '虑', '虫', '虽', '蚀', '蜡', '补', '装',
    '裤', '见', '观', '规', '视', '览', '订', '讨', '让', '训', '议', '讲', '许',
    '论', '访', '证', '评', '识', '诉', '诊', '词', '译', '诗', '诚', '详', '语',
    '误', '诸', '读', '课', '谈', '谋', '谐', '谓', '谢', '谨', '谱', '贝', '负',
    '贡', '财', '责', '贤', '货', '贩', '贪', '购', '贯', '贴', '贵', '贷', '贸',
    '费', '贺', '资', '赋', '赌', '赏', '赔', '赖', '赚', '赛', '赞', '赠', '赵',
    '赶', '趋', '跃', '践', '踪', '躲', '车', '轨', '转', '轮', '轻', '较', '辅',
    '辆', '辈', '辉', '辖', '辞', '达', '迁', '过', '运', '还', '进', '远', '违',
    '连', '迟', '递', '遗', '邓', '针', '钉', '钙', '钟', '钢', '钥', '钱', '钻',
    '铁', '铃', '银', '铺', '链', '销', '锁', '锂', '锋', '错', '锦', '键', '锯',
    '锻', '镀', '长', '门', '闪', '闭', '问', '闯', '闲', '间', '闷', '闹', '闻',
    '阅', '阳', '阴', '际', '陆', '陈', '陕', '险', '随', '隐', '雏', '雾', '静',
    '韦', '韩', '顶', '顺', '须', '顾', '顿', '颁', '预', '领', '颇', '颈', '频',
    '颗', '颜', '额', '风', '飘', '飞', '养', '馆', '马', '驰', '驱', '驳', '驶',
    '驻', '驾', '验', '骑', '骗', '骄', '骆', '骤', '髅', '鬓', '鱼', '鲁', '鲜',
    '鸟', '鸡', '鸣', '鸦', '鸭', '鹅', '鹰', '麦', '黄', '齿', '龄', '龙', '页',
    '顶', '顺', '须', '顾', '顿', '颁', '预', '领', '颇', '颈', '频', '颗', '题',
    '颜', '额', '风', '飘', '飞', '养', '馆', '马', '驰', '驱', '驳', '驶', '驻',
  ]

  const offenders = simplifiedOnly.filter((ch) => zhTW.includes(ch))
  assert.deepEqual(
    offenders,
    [],
    `zh-TW.json still holds Simplified forms: ${offenders.join('')}`,
  )
})

test('the Traditional Chinese copy uses Taiwan wording', () => {
  const zhTW = JSON.stringify(read('zh-TW.json'))

  // Taiwan wording for the terms this dictionary uses.
  for (const [simplified, traditional] of [
    ['项目', '專案'],
    ['记忆', '記憶'],
    ['点击', '點選'],
    ['设置', '設定'],
    ['保存', '儲存'],
    ['路径', '路徑'],
    ['复制', '複製'],
    ['刷新', '重新整理'],
    ['对话', '對話'],
    ['消息', '訊息'],
  ]) {
    assert.equal(zhTW.includes(simplified), false, `${simplified} must not appear in the Traditional copy`)
    assert.equal(zhTW.includes(traditional), true, `${traditional} is missing from the Traditional copy`)
  }
})

test('the client bundle copy uses Taiwan wording', () => {
  const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
  const start = source.indexOf("'zh-TW': {")
  const end = source.indexOf('routeLabel: (base, source)', start)
  assert.ok(start !== -1 && end !== -1, 'the client bundle must carry a zh-TW dictionary')
  const block = source.slice(start, end)

  for (const [simplified, traditional] of [
    ['项目', '專案'],
    ['记忆', '記憶'],
    ['插件', '外掛'],
    ['点击', '點選'],
    ['设置', '設定'],
    ['保存', '儲存'],
    ['路径', '路徑'],
    ['复制', '複製'],
    ['刷新', '重新整理'],
    ['对话', '對話'],
    ['消息', '訊息'],
    ['默认', '預設'],
    ['加载', '載入'],
    ['覆盖', '覆寫'],
  ]) {
    assert.equal(block.includes(simplified), false, `${simplified} must not appear in the Traditional copy`)
    assert.equal(block.includes(traditional), true, `${traditional} is missing from the Traditional copy`)
  }
})
