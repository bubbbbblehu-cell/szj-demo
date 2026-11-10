import { t as translateUI } from '../i18n';
export const STORAGE_KEY = 'pixel-universe:exploration:v1';
export const worlds = [
  { id:'brand-vi', planet:'project-01', title:translateUI('品牌定调 / VI'), stamp:'✦' },
  { id:'key-visual', planet:'project-02', title:translateUI('主视觉 / KV'), stamp:'✹' },
  { id:'cg-art', planet:'project-03', title:translateUI('CG / 美术指导'), stamp:'◇' },
  { id:'h5-interaction', planet:'project-04', title:translateUI('H5 / 交互体验'), stamp:'✚' },
  { id:'graphic-extension', planet:'project-05', title:translateUI('平面 / 视觉延展'), stamp:'▧' },
  { id:'creative-competition', planet:'project-06', title:translateUI('创意 / 赛事设计'), stamp:'★' },
] as const;
export type WorldId = typeof worlds[number]['id'];
export const introduction = [
  { speaker:translateUI('宇航狗'), text:translateUI('嘀——发现一位误入创意星系的旅客。') },
  { speaker:translateUI('宇航狗'), text:translateUI('这里收藏着宋志杰的六个作品世界。') },
  { speaker:translateUI('宇航狗'), text:translateUI('有些负责第一眼，有些负责让你忍不住再点一下。') },
  { speaker:translateUI('宇航狗'), text:translateUI('听说他和不少游戏英雄打过交道。放心，今天不需要排位。') },
  { speaker:'SYSTEM', text:translateUI('准备完毕。选择你的第一站吧。') },
];
export const typewriterInterval = 26;

export const idleDialogues = [
 translateUI('叽里咕噜~叽里咕噜~（太空语）'),
 translateUI('卷卷来也！'),
 translateUI('你好呀，欢迎来到卷卷宇宙汪！'),
 translateUI('饿饿，饭饭~'),
];
export const milestoneDialogues:Record<number,string> = {1:translateUI('第一颗星球记录完成！我就知道你很会选第一站。'),3:translateUI('已经探索一半。你比我更熟悉这片星系了。'),5:translateUI('只差最后一颗了。我偷偷准备了通关动画。'),6:translateUI('六颗都看完了？看来这些作品真的被你好好看见了。谢谢你。')};
export const chatterConfig={cooldown:30000,returnDelay:10000,visibleDuration:4500,idleMin:35000,idleMax:60000,idleChance:.35};
export const audioConfig={duration:24,volume:.4,effectVolume:.18,tempo:40,assetPaths:{bgm:'',click:'',dialogue:'',discover:'',complete:''}};
export const PREFERENCES_KEY='pixel-universe:preferences:v1';
