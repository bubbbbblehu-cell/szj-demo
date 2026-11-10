import { mediaAsset } from '../media';
import { t as translateUI } from '../i18n';
import type { PortfolioCase, PortfolioPlanet } from '../game/planets';
import { SOLAR_BODIES } from './orbits';

// Curated from the supplied Word document; no invented roles or metrics.
const cases: Record<string, PortfolioCase> = {
  "vi-friend": {
    "id": "vi-friend",
    "title": "MLBB 26Y 朋友节 · VI 手册",
    "subtitle": "品牌定调 / VI",
    "description": "MLBB 26Y朋友节，重点塑造的品牌形象为全年社交新玩法最多的节点 + 让MLBB玩家在有更丰富的社交体验。",
    "tags": [
      "品牌定调",
      "VI"
    ],
    "sections": [
      {
        "title": "创意阐释：",
        "body": "以“点赞”的战场表情作为核心图形，战场信号作为辅助图形，营造朋友快乐交流的轻松氛围；延续黄色为主基调，稳固用户心中“欢乐、轻松、社交”的节点调性氛围。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/friends-fest-1-adc233299b67.webp",
    "gallery": [
      {
        "src": "assets/cases/document/friends-fest-2-fc898d25cee0.webp",
        "alt": "MLBB 26Y 朋友节 · VI 手册 · 完整图 2",
        "width": 4180,
        "height": 3040
      }
    ],
    "imageSize": {
      "width": 8000,
      "height": 4500
    },
    "descriptionLabel": "项目背景：",
    "videos": [
      {
        "src": "assets/cases/videos/friends-26-4186cb88d5ce-soft-audio.mp4",
        "poster": "assets/cases/videos/friends-26-4186cb88d5ce-poster.webp",
        "title": "0827-finalV3",
        "width": 1920,
        "height": 1080
      }
    ]
  },
  "vi-as": {
    "id": "vi-as",
    "title": "MLBB AS 节点 · VI 手册",
    "subtitle": "品牌定调 / VI",
    "description": "MLBB 26yAS 基于深海主题战场，建立整体规范的视觉体系，视觉层面塑造“海渊对立、淘金狂热”的节点气质。",
    "tags": [
      "品牌定调",
      "VI"
    ],
    "sections": [
      {
        "title": "创意阐释：",
        "body": "以“具有攻击性的触手”的核心图形和“深渊凝视”的底纹，营造视觉冲击力和心理暗示；以“青蓝”为主色呈现深海基调，“红色与金色”为辅助色呼应微恐和淘金氛围，打造节点微恐视觉差异化。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/as-1-9de11bfe81b6.webp",
    "gallery": [
      {
        "src": "assets/cases/document/as-2-1ae733e19b75.webp",
        "alt": "MLBB AS 节点 · VI 手册 · 完整图 2",
        "width": 4535,
        "height": 3471
      }
    ],
    "imageSize": {
      "width": 8000,
      "height": 4500
    },
    "descriptionLabel": "项目背景：",
    "videos": [
      {
        "src": "assets/cases/videos/as-mood-c1ae5f172774-soft-audio.mp4",
        "poster": "assets/cases/videos/as-mood-c1ae5f172774-poster.webp",
        "title": "调性影片",
        "width": 1920,
        "height": 1080
      }
    ]
  },
  "vi-myhero25": {
    "id": "vi-myhero25",
    "title": "MLBB 25Y MY HERO · 视觉导览",
    "subtitle": "品牌定调 / VI",
    "description": "MLBB 25y MYHERO，基于为爱投票的活动主题推导和探索视觉风格/色彩/平面元素，服务英雄UGC活动的端内展示以及短外平面物料延展。",
    "tags": [
      "品牌定调",
      "VI"
    ],
    "sections": [
      {
        "title": "创意阐释：",
        "body": "玩家为角色投票、角色为玩家赢得高光，双方都为彼此而战，满腔热血。从同人创作的UGC文化里比较经典的漫画涂鸦风格入手，在logo设计中，融合爱心、王冠、分路的变形设计。用户后调感知强，成功塑造品牌节点认知。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/myhero-25-1bbb444f3722.jpg",
    "gallery": [],
    "imageSize": {
      "width": 8864,
      "height": 3256
    },
    "descriptionLabel": "项目背景："
  },
  "vi-myhero26": {
    "id": "vi-myhero26",
    "title": "MLBB 26Y MY HERO · 视觉导览",
    "subtitle": "品牌定调 / VI",
    "description": "MLBB 26y MYHERO，延用去年slogan主题基础上，保持大赛理念传递的一致性，深化用户对大赛以爱为出发点的印象，并衔接十周年节点。",
    "tags": [
      "品牌定调",
      "VI"
    ],
    "sections": [
      {
        "title": "创意阐释：",
        "body": "用王冠和爱心、星星结合，传达玩家对英雄的爱、为其戴冠，呼应Slogan叙事和十周年衔接。logo上保留MY HERO皇冠 LOGO 基础形，做了材质迭代升级，保证玩家认知基础上，有新的视觉亮点。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/myhero-26-256e5f1ebed0.jpg",
    "gallery": [],
    "imageSize": {
      "width": 8864,
      "height": 3256
    },
    "descriptionLabel": "项目背景："
  },
  "vi-ramadan": {
    "id": "vi-ramadan",
    "title": "MLBB 25Y 斋月 · 视觉定调",
    "subtitle": "品牌定调 / VI",
    "description": "围绕“金鼓擂动，惊喜狂响”进行视觉翻译，在上一年基础上迭代调性手册。",
    "tags": [
      "品牌定调",
      "VI"
    ],
    "sections": [
      {
        "title": "创意与执行",
        "body": "负责 DEMO 美术把控、色调占比、控件与元素优化和整体验收交付。原文记录：斋月地区满意度 75.2%，非斋地区 73.6%；GoldenMonth 节点认知度 88.9%，“超奖励”体验凸点认知度 88.3%。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/vi-ramadan-hd-01-dd867dc9a3a3.jpg",
    "gallery": [
      {
        "src": "assets/cases/originals/vi-ramadan-hd-02-9221ff0bcae0.png",
        "alt": "MLBB 25Y 斋月 · 视觉定调 · 作品展示 2",
        "width": 2493,
        "height": 1402
      }
    ],
    "imageSize": {
      "width": 3840,
      "height": 2160
    }
  },
  "kv-sf": {
    "id": "kv-sf",
    "title": "MLBB × Street Fighter · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "MLBB与SF联动，面对格斗类玩家用户，一方面强调玩家在开局时的内心正如同格斗家站在擂台上面临赛局开始一般，内心无比悸动；一方面展示皮肤细节。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "用IP色代表角色，也代表不同玩家开局时情绪色（红色冲劲、蓝色专注、绿色冷静、橙色兴奋），用外扩构图代表不同情绪的集中爆发。英雄们立于高地，蓄势待发，向玩家传递关键信息“ROUND 1即悸动”。"
      },
      {
        "title": "结果：",
        "body": "KV满意度82.8%，玩家最满意的是角色皮肤/技能特效（占比58.3%），其次是Round1与MLBB的结合（占比49.3%），说明玩家被皮肤有效吸引，同时被成功识别到ROUND1，建立起联动记忆。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-sf-hd-01-98eb5c857f74.jpg",
    "gallery": [
      {
        "src": "assets/cases/originals/kv-sf-hd-02-756f82ac75e9.jpg",
        "alt": "MLBB × Street Fighter · 主视觉 · 作品展示 2",
        "width": 6000,
        "height": 3376
      }
    ],
    "imageSize": {
      "width": 6000,
      "height": 3376
    },
    "descriptionLabel": "项目背景：",
    "videos": [
      {
        "src": "assets/cases/videos/streetfighter-99441f2a2fe7-soft-audio.mp4",
        "poster": "assets/cases/videos/streetfighter-99441f2a2fe7-poster.webp",
        "title": "Street Fighter",
        "width": 3840,
        "height": 2160
      }
    ]
  },
  "kv-avatar": {
    "id": "kv-avatar",
    "title": "MLBB × 降世神通 · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "26Y朋友节作为全年唯一IP联动送主角：联动东南亚知名IP《降世神通：最后的气宗》。主kv营造快乐、喜悦、轻松愉快的游戏社交体验感受。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "定格安昂、卡塔拉和ml英雄一次完美配合达成后，互赞的瞬间。除角色露出外，增加农场场景和作物卖点露出，强化朋友节社交多玩法的内容信息，并通过风格化涂鸦，MVP等字样，传达节点轻松愉悦的氛围调性。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-avatar-hd-01-a830bd7cba06.png",
    "gallery": [],
    "imageSize": {
      "width": 3840,
      "height": 2160
    },
    "descriptionLabel": "项目背景：",
    "videos": [
      {
        "src": "assets/cases/videos/avatar-hd-83a1878b4a60.mp4",
        "poster": "assets/cases/videos/avatar-hd-83a1878b4a60.webp",
        "title": "MLBB × Avatar",
        "width": 2560,
        "height": 1440
      }
    ]
  },
  "kv-as-battle": {
    "id": "kv-as-battle",
    "title": "MLBB AS · 深海战斗 KV",
    "subtitle": "主视觉 / KV",
    "description": "配合AS节点微恐调性，视觉化呈现深海战斗氛围，重点让玩家直观感受到新皮肤的细节亮点。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "模拟沉船里的窗户视角，让玩家身处深海，面向近在眼前的危险。触手缠上碎裂的沉船窗户，窗外的英雄小队正和前方的女妖激战。清晰展示战斗对抗感和英雄皮肤细节。"
      },
      {
        "title": "结果：",
        "body": "配套KV综合满意度76.94%，节点的信息内容有效触达玩家，翀的皮肤质量等引起玩家讨论。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-as-battle-hd-01-d6d5f4653457.jpg",
    "gallery": [],
    "imageSize": {
      "width": 5000,
      "height": 2812
    },
    "descriptionLabel": "项目背景："
  },
  "kv-as-gold": {
    "id": "kv-as-gold",
    "title": "MLBB AS · 深海淘金 KV",
    "subtitle": "主视觉 / KV",
    "description": "AS节点拥有年度最大主题地图（深海版本）+全局玩法(淘金主题)，需要通过“周大福联名KV”，建立玩家对节点深海淘金的体验认知。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "主角翀在深海淘到真金，放大“real gold”信息，配合BD活动，直观展示真金饰品，放大真金信息，带给玩家最重磅的节点奖励。"
      },
      {
        "title": "结果：",
        "body": "配套KV综合满意度76.94%，节点的信息内容有效触达玩家，真金奖励内容、活动讨论等引起玩家讨论。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-as-gold-hd-01-a902db5700a1.png",
    "gallery": [],
    "imageSize": {
      "width": 4096,
      "height": 2304
    },
    "descriptionLabel": "项目背景："
  },
  "kv-ugc": {
    "id": "kv-ugc",
    "title": "MLBB 25Y UGC · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "25yUGCkv，作为MLBB全年英雄共创生态最高点，需要撬动全民创作热情，传达核心概念：鼓励玩家为所「爱」的英雄创作、应援。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "挑选高人气英雄，让英雄们跃起在高空中，下方是玩家搭建的虚拟城市。冲破云层形成爱心的形状，代表着玩家用爱打造的舞台。其中飘飞的设计票，参考了端内投票券设计并进行视觉美化，呼应到端内投票活动。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-ugc-hd-01-bf2b63941044.jpg",
    "gallery": [],
    "imageSize": {
      "width": 4000,
      "height": 2250
    },
    "descriptionLabel": "项目背景："
  },
  "kv-mcgg4": {
    "id": "kv-mcgg4",
    "title": "MCGG S4 全民赛 · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "奖杯在中心四射出斗魂火焰，特效中是联动小小指挥官们，整体朝向中心，准备迎接新一季的全民赛。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-mcgg4-hd-01-cc2ab3ccbc5d.png",
    "gallery": [],
    "imageSize": {
      "width": 1920,
      "height": 1080
    },
    "descriptionLabel": "核心创意："
  },
  "kv-mcgg3": {
    "id": "kv-mcgg3",
    "title": "MCGG S3 全民赛 · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "全民参赛无限制，新人和大佬同台竞技，凭策略和运气来获得荣誉。每个小小指挥官都离奖杯近在咫尺，没有门槛，从四面八方来共同争夺奖杯和荣誉。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-mcgg3-hd-01-5762b482b0a6.png",
    "gallery": [],
    "imageSize": {
      "width": 1920,
      "height": 1080
    },
    "descriptionLabel": "核心创意："
  },
  "kv-mcgg-launch": {
    "id": "kv-mcgg-launch",
    "title": "MCGG 全球上线 · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "游戏全球上线，小小指挥官们闪耀登场，邀请面前的你一起加入战斗！",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-mcgg-launch-hd-01-ffc594a7c0b9.png",
    "gallery": [],
    "imageSize": {
      "width": 3840,
      "height": 2160
    },
    "descriptionLabel": "核心创意："
  },
  "kv-cny": {
    "id": "kv-cny",
    "title": "决胜巅峰 · 春节主视觉",
    "subtitle": "主视觉 / KV",
    "description": "金马开道送真金，仅用16天时间，完成了春节主视觉的草图创意到最终动态落地，按时完成交付，且质量获得内外认可。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-cny-hd-01-63872f6f520b.jpg",
    "gallery": [],
    "imageSize": {
      "width": 1920,
      "height": 1080
    },
    "descriptionLabel": "核心创意：",
    "videos": [
      {
        "src": "assets/cases/videos/cny-6158b015ae92-soft-audio.mp4",
        "poster": "assets/cases/videos/cny-6158b015ae92-poster.webp",
        "title": "春节",
        "width": 1920,
        "height": 1080
      }
    ]
  },
  "kv-transformers": {
    "id": "kv-transformers",
    "title": "决胜巅峰 × 变形金刚 · 主视觉",
    "subtitle": "主视觉 / KV",
    "description": "服务于全渠道吸量，展示联动亮点（6大角色，一次集结），需要一次性展示6大人气角色皮肤官宣KV素材，营造对抗感。",
    "tags": [
      "主视觉",
      "KV"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/kv-transformers-hd-01-17e985238f89.png",
    "gallery": [],
    "imageSize": {
      "width": 1920,
      "height": 1080
    },
    "descriptionLabel": "核心创意："
  },
  "cg-next": {
    "id": "cg-next",
    "title": "MLBB NEXT · CG 美术指导",
    "subtitle": "CG / 美术指导",
    "description": "基于25ynext四个端内地图玩法，在CG里做视觉化表达，通过四个不同的英雄角色，在next更新的新地图中发现新的对局所在之地，带来“另辟战场，秀你一脸” 的NEXT MAP CHANGE游玩体验。",
    "tags": [
      "CG",
      "美术指导"
    ],
    "sections": [
      {
        "title": "负责内容：",
        "body": "承接CG与美术的美术概设反馈、模型监修。重点强化高概念战场的美术设计和 MLBB优化后的圣殿岛美术的区隔，让玩家对于版本地图变化有更深刻和清晰的认知。"
      },
      {
        "title": "结果：",
        "body": "CG满意度77.47%，完播比达75.9%，有效传递”新地图玩法“信息，玩家表示新玩法清晰且愿意体验。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/next-art-1-cab9a9025741.webp",
    "gallery": [
      {
        "src": "assets/cases/document/next-art-2-42c9ba644aff.webp",
        "alt": "MLBB NEXT · 美术指导 2",
        "width": 10000,
        "height": 4678
      },
      {
        "src": "assets/cases/document/next-map-trailer-731b53028dfd.webp",
        "alt": "MLBB NEXT · CG 美术指导",
        "width": 1749,
        "height": 899
      }
    ],
    "imageSize": {
      "width": 10000,
      "height": 2843
    },
    "videos": [
      {
        "src": "assets/cases/videos/next-art-direction-fd41f0bec536-soft-audio.mp4",
        "poster": "assets/cases/videos/next-art-direction-8d8f627e590b-poster.webp",
        "title": "MLBB NEXT · 美术指导视频",
        "width": 1920,
        "height": 1080
      }
    ],
    "descriptionLabel": "CG创意："
  },
  "flat-sf": {
    "id": "flat-sf",
    "title": "MLBB × Street Fighter · 商店五图",
    "subtitle": "平面 / 视觉延展",
    "description": "还原 IP 风格，在紧张的监修时间内完成联动商店五图交付。",
    "tags": [
      "平面",
      "视觉延展"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/flat-sf-hd-01-0a983db6bad3.jpg",
    "gallery": [
      {
        "src": "assets/cases/originals/flat-sf-hd-02-5be8010ac3c8.jpg",
        "alt": "MLBB × Street Fighter · 商店五图 · 作品展示 2",
        "width": 2208,
        "height": 1242
      },
      {
        "src": "assets/cases/originals/flat-sf-hd-03-4b35153e9e44.jpg",
        "alt": "MLBB × Street Fighter · 商店五图 · 作品展示 3",
        "width": 2208,
        "height": 1242
      },
      {
        "src": "assets/cases/originals/flat-sf-hd-04-e18552510eb7.jpg",
        "alt": "MLBB × Street Fighter · 商店五图 · 作品展示 4",
        "width": 2208,
        "height": 1242
      },
      {
        "src": "assets/cases/originals/flat-sf-hd-05-a3cb4ac38b5b.jpg",
        "alt": "MLBB × Street Fighter · 商店五图 · 作品展示 5",
        "width": 2208,
        "height": 1242
      }
    ],
    "imageSize": {
      "width": 2208,
      "height": 1242
    }
  },
  "flat-anniversary": {
    "id": "flat-anniversary",
    "title": "MLBB 九周年 · 徽章与背景",
    "subtitle": "平面 / 视觉延展",
    "description": "在9周年庆节点物料基础上，借h5的玩法晒徽章，释放福利加码信息，刺激玩家收集徽章，助力玩家端内回流。",
    "tags": [
      "平面",
      "视觉延展"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "从玩家视觉审美偏好出发，使用趣味调性的扁平绘制风格，结合端内活动的玩法，设计创作了23款徽章及横竖版背景，助力H5视觉美观度提升，达成玩家互动。"
      },
      {
        "title": "结果：",
        "body": "h5点击率破新高，撬动情感杠杆增强与玩家联结，使用户认知ML生日是年度\"超有情\"回馈盛典，冲高回流，保温活跃。老玩家表示“很喜欢”，年轻玩家表示“愿意分享”，刺激了玩家情感分享。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/image38.webp",
    "gallery": [
      {
        "src": "assets/cases/document/image39.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 2",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image40.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 3",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image41.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 4",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image42.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 5",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image43.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 6",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image44.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 7",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image45.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 8",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image46.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 9",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image47.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 10",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image48.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 11",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image49.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 12",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image50.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 13",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image51.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 14",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image52.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 15",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image53.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 16",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image54.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 17",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image55.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 18",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image56.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 19",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image57.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 20",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image58.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 21",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image59.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 22",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/image60.webp",
        "alt": "MLBB 九周年 · 徽章与背景 · 作品展示 23",
        "width": 1440,
        "height": 1440
      },
      {
        "src": "assets/cases/document/anniversary-collage-3d123d4a35fb.webp",
        "alt": "MLBB 九周年 · 霓虹派对盛典 · 背景与活动视觉合集",
        "width": 1254,
        "height": 1254
      },
      {
        "src": "assets/cases/originals/image133.jpeg",
        "alt": "作品展示",
        "width": 3200,
        "height": 1600
      },
      {
        "src": "assets/cases/originals/image134.jpeg",
        "alt": "作品展示",
        "width": 2208,
        "height": 1242
      },
      {
        "src": "assets/cases/originals/image135.jpeg",
        "alt": "作品展示",
        "width": 2208,
        "height": 1242
      },
      {
        "src": "assets/cases/originals/image136.jpeg",
        "alt": "作品展示",
        "width": 2208,
        "height": 1242
      },
      {
        "src": "assets/cases/originals/image137.jpeg",
        "alt": "作品展示",
        "width": 2208,
        "height": 1242
      }
    ],
    "imageSize": {
      "width": 1440,
      "height": 1440
    },
    "descriptionLabel": "项目背景：",
    "categorySuffix": "H5"
  },
  "flat-as": {
    "id": "flat-as",
    "title": "MLBB AS · 节点延展",
    "subtitle": "平面 / 视觉延展",
    "description": "MLBB-26yAS节点，icon迭代、五图等物料制作。",
    "tags": [
      "平面",
      "视觉延展"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/image116.webp",
    "gallery": [
      {
        "src": "assets/cases/document/image117.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 3",
        "width": 1440,
        "height": 810
      },
      {
        "src": "assets/cases/document/image118.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 4",
        "width": 1440,
        "height": 810
      },
      {
        "src": "assets/cases/document/image119.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 5",
        "width": 1440,
        "height": 810
      },
      {
        "src": "assets/cases/document/image120.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 6",
        "width": 1024,
        "height": 1024
      },
      {
        "src": "assets/cases/document/image121.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 7",
        "width": 1440,
        "height": 810
      },
      {
        "src": "assets/cases/document/image122.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 8",
        "width": 1440,
        "height": 810
      },
      {
        "src": "assets/cases/document/image123.webp",
        "alt": "MLBB AS · 节点延展 · 作品展示 9",
        "width": 1440,
        "height": 810
      }
    ],
    "imageSize": {
      "width": 1024,
      "height": 1024
    },
    "descriptionLabel": "项目说明"
  },
  "flat-granger": {
    "id": "flat-granger",
    "title": "MLBB UGC · 格兰杰答谢物料",
    "subtitle": "平面 / 动态延展",
    "description": "25yUGC答谢视频，UGC投票结束后，需制作TOP1英雄致谢物料，回应玩家的投票结果。首次独立跟进动态视频内容制作，提出增加画面动态运镜，提高物料品质，展示格兰杰幼时经历到如今众人喜爱，利用反差击中玩家内心。",
    "tags": [
      "平面",
      "动态延展"
    ],
    "sections": [
      {
        "title": "核心创意：",
        "body": "从角色设定上出发，让人气TOP1英雄「格兰杰」站在修道院的礼堂中，拉起小提琴感谢玩家的投票。用幼时可爱和如今的酷飒做运镜对比，反差萌击中玩家喜好，舆论一致好评。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/image127.webp",
    "gallery": [],
    "imageSize": {
      "width": 1080,
      "height": 1440
    },
    "descriptionLabel": "项目背景：",
    "videos": [
      {
        "src": "assets/cases/videos/granger-thanks-af479c2ab40f-soft-audio.mp4",
        "poster": "assets/cases/videos/granger-thanks-af479c2ab40f-poster.webp",
        "title": "格兰杰答谢视频_en",
        "width": 1080,
        "height": 1920
      }
    ],
    "videoPlacement": "before-images"
  },
  "h5-ink": {
    "id": "h5-ink",
    "title": "王者荣耀 · 墨染江湖",
    "subtitle": "H5 / 交互体验",
    "description": "配套墨染江湖系列武侠皮肤，以全景探索形式展示武侠世界观。",
    "tags": [
      "H5",
      "交互体验"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/image65.webp",
    "gallery": [
      {
        "src": "assets/cases/document/image66.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 2",
        "width": 1440,
        "height": 661
      },
      {
        "src": "assets/cases/document/image67.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 3",
        "width": 1440,
        "height": 682
      },
      {
        "src": "assets/cases/document/image68.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 4",
        "width": 1440,
        "height": 745
      },
      {
        "src": "assets/cases/document/image69.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 5",
        "width": 1440,
        "height": 585
      },
      {
        "src": "assets/cases/document/image70.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 6",
        "width": 1440,
        "height": 665
      },
      {
        "src": "assets/cases/document/image71.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 7",
        "width": 1440,
        "height": 665
      },
      {
        "src": "assets/cases/document/image72.webp",
        "alt": "王者荣耀 · 墨染江湖 · 作品展示 8",
        "width": 1440,
        "height": 665
      }
    ],
    "href": "https://pvp.qq.com/cp/a20240708/index.html?e_code=535736&ingamefullscreen=1",
    "imageSize": {
      "width": 1312,
      "height": 739
    }
  },
  "h5-amber": {
    "id": "h5-amber",
    "title": "王者荣耀 · 琥珀纪元",
    "subtitle": "H5 / 交互体验",
    "description": "配套琥珀纪元系列科幻皮肤，以叙事与小游戏展示科幻世界观。",
    "tags": [
      "H5",
      "交互体验"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/image73.webp",
    "gallery": [
      {
        "src": "assets/cases/document/image74.webp",
        "alt": "王者荣耀 · 琥珀纪元 · 作品展示 2",
        "width": 1440,
        "height": 720
      },
      {
        "src": "assets/cases/document/image75.webp",
        "alt": "王者荣耀 · 琥珀纪元 · 作品展示 3",
        "width": 1440,
        "height": 665
      },
      {
        "src": "assets/cases/document/image76.webp",
        "alt": "王者荣耀 · 琥珀纪元 · 作品展示 4",
        "width": 1440,
        "height": 665
      },
      {
        "src": "assets/cases/document/image77.webp",
        "alt": "王者荣耀 · 琥珀纪元 · 作品展示 5",
        "width": 1440,
        "height": 665
      },
      {
        "src": "assets/cases/document/image78.webp",
        "alt": "王者荣耀 · 琥珀纪元 · 作品展示 6",
        "width": 1440,
        "height": 665
      }
    ],
    "href": "https://pvp.qq.com/cp/a20240115wzfb/?e_code=535736&ingamefullscreen=1",
    "imageSize": {
      "width": 1440,
      "height": 885
    }
  },
  "h5-time": {
    "id": "h5-time",
    "title": "王者荣耀 · 时之奇旅",
    "subtitle": "H5 / 交互体验",
    "description": "配套时之系列皮肤，以漫画风格与场景探索展示二次元世界观。",
    "tags": [
      "H5",
      "交互体验"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/h5-time-hd-01-bc45470b642e.png",
    "gallery": [
      {
        "src": "assets/cases/originals/h5-time-hd-02-4790b40e977b.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 2",
        "width": 2000,
        "height": 924
      },
      {
        "src": "assets/cases/originals/h5-time-hd-03-4097b8a86db8.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 3",
        "width": 1624,
        "height": 750
      },
      {
        "src": "assets/cases/originals/h5-time-hd-04-a5ee131fac95.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 4",
        "width": 991,
        "height": 567
      },
      {
        "src": "assets/cases/originals/h5-time-hd-05-1c591db1ccca.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 5",
        "width": 1624,
        "height": 750
      },
      {
        "src": "assets/cases/originals/h5-time-hd-06-abffbdd3e96f.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 6",
        "width": 2000,
        "height": 924
      },
      {
        "src": "assets/cases/originals/h5-time-hd-07-ab3233ba6bae.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 7",
        "width": 1624,
        "height": 750
      },
      {
        "src": "assets/cases/originals/h5-time-hd-08-c37761dc8699.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 8",
        "width": 3248,
        "height": 1500
      },
      {
        "src": "assets/cases/originals/h5-time-hd-09-05e4084e2009.png",
        "alt": "王者荣耀 · 时之奇旅 · 作品展示 9",
        "width": 2000,
        "height": 924
      }
    ],
    "href": "https://pvp.qq.com/ingame/cp/a20230918szql/?e_code=535736&ingamefullscreen=1",
    "imageSize": {
      "width": 2000,
      "height": 924
    }
  },
  "h5-tft": {
    "id": "h5-tft",
    "title": "云顶之弈 · 画中灵集卡活动",
    "subtitle": "H5 / 交互体验",
    "description": "以收集点亮图鉴的形式，帮助玩家在赛季初感受主题、熟悉弈子技能。",
    "tags": [
      "H5",
      "交互体验"
    ],
    "sections": [
      {
        "title": "",
        "body": "负责整体交互设计、包装排版、卷轴设计与转场动画设计。"
      }
    ],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/image88.webp",
    "gallery": [
      {
        "src": "assets/cases/document/image89.webp",
        "alt": "云顶之弈 · 画中灵集卡活动 · 作品展示 2",
        "width": 1216,
        "height": 1108
      },
      {
        "src": "assets/cases/document/image90.webp",
        "alt": "云顶之弈 · 画中灵集卡活动 · 作品展示 3",
        "width": 1406,
        "height": 711
      },
      {
        "src": "assets/cases/document/image91.webp",
        "alt": "云顶之弈 · 画中灵集卡活动 · 作品展示 4",
        "width": 1408,
        "height": 719
      },
      {
        "src": "assets/cases/document/image92.webp",
        "alt": "云顶之弈 · 画中灵集卡活动 · 作品展示 5",
        "width": 1409,
        "height": 714
      },
      {
        "src": "assets/cases/document/image93.webp",
        "alt": "云顶之弈 · 画中灵集卡活动 · 作品展示 6",
        "width": 1406,
        "height": 712
      },
      {
        "src": "assets/cases/document/image94.webp",
        "alt": "云顶之弈 · 画中灵集卡活动 · 作品展示 7",
        "width": 1440,
        "height": 728
      }
    ],
    "imageSize": {
      "width": 1399,
      "height": 710
    }
  },
  "h5-charity": {
    "id": "h5-charity",
    "title": "腾讯公益 · 公益人格测试",
    "subtitle": "H5 / 交互体验",
    "description": "公益人格测试的互动页面与视觉包装。",
    "tags": [
      "H5",
      "交互体验"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/document/charity-h5-1-eb776d60b61f.webp",
    "gallery": [
      {
        "src": "assets/cases/document/charity-h5-2-8c82d4e1586d.webp",
        "alt": "腾讯公益 · 公益人格测试 · 完整图 2",
        "width": 2627,
        "height": 1125
      }
    ],
    "href": "https://playforgood.qq.com/cp/actmbti20240904/index.html",
    "imageSize": {
      "width": 5710,
      "height": 2048
    }
  },
  "creative-joc": {
    "id": "creative-joc",
    "title": "金铲铲之战 JOC · 赛事设计",
    "subtitle": "创意 / 赛事设计",
    "description": "对JOC奖杯的视觉及品牌内核进行全面升级。从金铲铲赛事的价值概念出发，讲品牌故事，做高品质、有故事、有精神的奖杯。利用国际简洁化的视觉和概念，传递全民参与全民社交的赛事精神。",
    "tags": [
      "创意",
      "赛事设计"
    ],
    "sections": [],
    "credit": "案例资料：宋志杰工作文档 · 按工作类型整理，反馈保留原文口径",
    "image": "assets/cases/originals/creative-joc-hd-01-e747f8291247.png",
    "gallery": [
      {
        "src": "assets/cases/originals/creative-joc-hd-02-261584f60e4a.png",
        "alt": "金铲铲之战 JOC · 赛事设计 · 作品展示 2",
        "width": 1300,
        "height": 1412
      },
      {
        "src": "assets/cases/originals/creative-joc-hd-03-0a299fd554ac.png",
        "alt": "金铲铲之战 JOC · 赛事设计 · 作品展示 3",
        "width": 1903,
        "height": 960
      },
      {
        "src": "assets/cases/originals/creative-joc-hd-04-b8b6a379a66d.png",
        "alt": "金铲铲之战 JOC · 赛事设计 · 作品展示 4",
        "width": 2281,
        "height": 1004
      },
      {
        "src": "assets/cases/originals/creative-joc-hd-05-ca0b7b93f197.png",
        "alt": "金铲铲之战 JOC · 赛事设计 · 作品展示 5",
        "width": 1068,
        "height": 513
      },
      {
        "src": "assets/cases/originals/creative-joc-extra-ad28af11c19e.png",
        "alt": "金铲铲之战 JOC · 赛事设计",
        "width": 2187,
        "height": 1191
      },
      {
        "src": "assets/cases/originals/creative-joc-hd-06-80c285179886.png",
        "alt": "金铲铲之战 JOC · 赛事设计 · 作品展示 6",
        "width": 1792,
        "height": 828
      }
    ],
    "href": "https://weixin.qq.com/sph/ABn0arPMcb",
    "imageSize": {
      "width": 1907,
      "height": 1062
    },
    "descriptionLabel": "项目说明："
  },
  "cg-friends26": {
    "id": "cg-friends26",
    "title": "MLBB-26y 朋友节-CG美术指导",
    "subtitle": "CG / 美术指导",
    "descriptionLabel": "TONE调/美术概设：",
    "description": "不依托IP做地图场景的整体换肤和融合，而从视觉上放大朋友节节点氛围：",
    "tags": [
      "CG",
      "美术指导"
    ],
    "sections": [
      {
        "title": "【色彩调性】",
        "body": "和朋友一起轻松、热闹、愉快感受的视觉翻译"
      },
      {
        "title": "【包装设计】",
        "body": "朋友间互相碰撞的社交反应的视觉转化"
      },
      {
        "title": "【差异对比】",
        "body": "“分头行动效果有限” 和“好友集合，欢乐全开” 的前后视觉差异"
      }
    ],
    "image": "assets/cases/originals/cg-friends26-01-ecd8b8a74cd9.jpg",
    "imageSize": {
      "width": 8000,
      "height": 5208
    },
    "gallery": [
      {
        "src": "assets/cases/originals/cg-friends26-02-70d1e3ccb3f7.jpg",
        "alt": "MLBB-26y 朋友节-CG美术指导",
        "width": 7360,
        "height": 2264
      },
      {
        "src": "assets/cases/originals/cg-friends26-03-8ebba1cad9ae.jpg",
        "alt": "MLBB-26y 朋友节-CG美术指导",
        "width": 4150,
        "height": 1568
      },
      {
        "src": "assets/cases/originals/cg-friends26-04-f265f88bc213.jpg",
        "alt": "MLBB-26y 朋友节-CG美术指导",
        "width": 1920,
        "height": 1080
      }
    ],
    "videos": [
      {
        "src": "assets/cases/videos/cg-friends26-1440p.mp4",
        "poster": "assets/cases/videos/cg-friends26-poster.webp",
        "title": "MLBB-26y 朋友节-CG美术指导",
        "width": 2560,
        "height": 1440
      }
    ]
  }
};

const groups = [["vi-friend", "vi-as", "vi-myhero25", "vi-myhero26", "vi-ramadan"], ["kv-sf", "kv-avatar", "kv-as-battle", "kv-as-gold", "kv-ugc", "kv-mcgg4", "kv-mcgg3", "kv-mcgg-launch", "kv-cny", "kv-transformers"], ["cg-friends26", "cg-next"], ["h5-ink", "h5-amber", "h5-time", "h5-tft", "h5-charity"], ["flat-sf", "flat-anniversary", "flat-as", "flat-granger"], ["creative-joc"]];
export const SOLAR_PROJECTS: PortfolioPlanet[] = SOLAR_BODIES.map((body, index) => {
  const entries = groups[index].map(key => {
    const source = cases[key];
    const item: PortfolioCase = {
      ...source, title: translateUI(source.title), subtitle: translateUI(source.subtitle),
      description: translateUI(source.description), descriptionLabel: source.descriptionLabel ? translateUI(source.descriptionLabel) : undefined, tags: source.tags.map(translateUI),
      credit: source.credit ? translateUI(source.credit) : undefined,
      sections: source.sections?.map(section => ({ title: translateUI(section.title), body: translateUI(section.body) })),
      gallery: source.gallery?.map(image => ({ ...image, alt: translateUI(image.alt) })),
      videos: source.videos?.map(video => ({ ...video, title: translateUI(video.title) })),
    };
    return { ...item, image: item.image ? mediaAsset(item.image) : undefined, gallery: item.gallery?.map(image => ({ ...image, src: mediaAsset(image.src) })), videos: item.videos?.map(video => ({ ...video, src: mediaAsset(video.src), poster: video.poster ? mediaAsset(video.poster) : undefined })) };
  });
  return { ...entries[0], id: body.id, cases: entries, category: body.category, x: 0, y: 0, visualRadius: body.size, triggerPadding: 1, spriteKey: body.id };
});
