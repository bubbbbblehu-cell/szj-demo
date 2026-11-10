import { mediaAsset } from '../media';
import { t as translateUI } from '../i18n';
/** The full CV is read in one continuous scroll, with optional chapter shortcuts. */
export function mountAboutDialog(dialog: HTMLDialogElement): () => void {
  dialog.id = 'about-panel';
  dialog.className = 'pixel-dialog about-dialog cv-dialog';
  dialog.setAttribute('aria-labelledby', 'about-title');
  dialog.innerHTML = translateUI(`
    <header class="cv-header">
      <span class="cv-mark" aria-hidden="true"><i></i><i></i><i></i></span>
      <div><span class="cv-eyebrow">PERSONAL FILE / 001</span><h2 id="about-title">关于宋志杰</h2></div>
      <button type="button" class="cv-close" aria-label="关闭个人简历">×</button>
    </header>
    <nav class="cv-chapters" aria-label="简历章节">
      <button type="button" aria-controls="cv-personal">个人资料</button>
      <button type="button" aria-controls="cv-experience">工作经历</button>
    </nav>
    <div class="cv-reading-area">
      <section id="cv-personal" class="cv-page cv-personal" aria-label="个人资料" tabindex="-1">
        <div class="cv-introduction">
          <div class="cv-identity"><div><span class="cv-section-label">ABOUT ME</span>
          <h3>宋志杰<span>SONG ZHIJIE</span></h3></div><img class="cv-portrait" src="${import.meta.env.BASE_URL}assets/optimized/portrait-open-ring-transparent.webp" width="1254" height="1254" alt="小狗证件照" /></div>
          <p class="cv-position">品牌内容创意 · 游戏视觉设计</p>
          <p class="cv-years"><strong>7</strong><span>年工作经验</span></p>
          <p class="cv-summary">专注游戏品宣、平面物料、KV创意与绘制、H5交互创意与设计、视频美术指导</p>
          <section class="cv-education"><h4>教育背景</h4>
          <p class="cv-school-line"><span>黑龙江大学</span><span>传播学（网络与新媒体方向）</span></p></section>
        </div>
        <div class="cv-details">
          <h4>联系我</h4>
          <dl><div><dt>手机 / 微信</dt><dd><a href="tel:18846437063">18846437063</a></dd></div>
          <div><dt>邮箱</dt><dd><a href="mailto:1002554028@qq.com">1002554028@qq.com</a></dd></div></dl>
          <figure class="cv-contact-qr"><a href="${import.meta.env.BASE_URL}assets/contact/wechat-qr.png" target="_blank" rel="noopener" aria-label="查看微信二维码原图"><img src="${import.meta.env.BASE_URL}assets/contact/wechat-qr.png" width="1328" height="1286" alt="微信联系二维码" loading="lazy" decoding="async" /></a><figcaption>微信扫码联系我</figcaption></figure>
        </div>
      </section>
      <section id="cv-experience" class="cv-page cv-career" aria-label="工作经历" tabindex="-1">
      <section id="cv-moonton" class="cv-career-job" aria-label="沐瞳科技工作经历" tabindex="-1">
        <div class="cv-job-heading"><span class="cv-section-label">2024-now</span><h3>沐瞳科技</h3><p>品牌内容创意设计</p></div>
        <div class="cv-job-copy"><h4>主要职责</h4><p>负责游戏品宣的节点定调手册、KV、H5、视频美术指导等视觉产出。</p>
        <h4>核心服务</h4><ul><li><strong>Mobile Legends: Bang Bang</strong><span>英雄赛季、联动节点、9 周年节点、玩法节点及国服等。</span></li><li><strong>Magic Chess: GOGO</strong><span>赛季 KV 等。</span></li></ul></div>
      </section>
      <section id="cv-aoki" class="cv-career-job" aria-label="杭州青木工作经历" tabindex="-1">
        <div class="cv-job-heading"><span class="cv-section-label">2022 — 2024</span><h3>杭州青木</h3><p>资深创意设计师</p></div>
        <div class="cv-job-copy"><h4>主要职责</h4><p>负责游戏 KV 创意及绘制、H5 交互创意及设计。</p>
        <h4>核心服务</h4><p>腾讯 MOBA 产品：王者荣耀、腾讯 LOLM、金铲铲之战。</p><p>负责版本 H5、故事站设计及平面 KV。</p></div>
      </section>
      <section id="cv-weibo" class="cv-career-job" aria-label="新浪微博工作经历" tabindex="-1">
        <div class="cv-job-heading"><span class="cv-section-label">2020 — 2021</span><h3>新浪微博</h3><p>游戏广告运营</p></div>
        <div class="cv-job-copy"><h4>主要职责</h4><p>负责头部游戏的宣发买量及美术素材。</p>
        <h4>核心服务</h4><ul><li><strong>网易 · 梦幻西游</strong></li><li><strong>灵犀互娱 · 三国志战略版</strong></li></ul></div>
      </section>
      </section>
    </div>
    <footer class="cv-footer">
      <a class="cv-resume-pdf" href="${mediaAsset('assets/resume/song-zhijie-resume-2026.pdf')}" target="_blank" rel="noopener noreferrer" aria-label="查看宋志杰2026简历PDF">查看简历 PDF ↗</a>
      <button type="button" class="cv-return" data-gamepad-confirm>返回宇宙</button>
    </footer>`);

  const sections = [...dialog.querySelectorAll<HTMLElement>('.cv-page')];
  const chapters = [...dialog.querySelectorAll<HTMLButtonElement>('.cv-chapters button')];
  const readingArea = dialog.querySelector<HTMLElement>('.cv-reading-area')!;
  const returnButton = dialog.querySelector<HTMLButtonElement>('.cv-return')!;
  let active = -1;
  function highlight(index: number): void {
    if (active === index) return;
    active = index;
    chapters.forEach((button, i) => {
      button.setAttribute('aria-pressed', String(i === index));
      if(i === index) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  }
  function sectionTop(index: number): number { return sections[index].offsetTop - sections[0].offsetTop; }
  chapters.forEach((button, index) => button.addEventListener('click', () => {
    readingArea.scrollTo({ top: sectionTop(index), behavior: 'auto' });
    highlight(index);
    sections[index].focus({ preventScroll: true });
  }));
  readingArea.addEventListener('scroll', () => {
    const last = sections.length - 1;
    if (readingArea.scrollTop > 0 && readingArea.scrollTop + readingArea.clientHeight >= readingArea.scrollHeight - 2) { highlight(last); return; }
    let index = 0;
    for (let i = 1; i < sections.length; i++) if (sectionTop(i) <= readingArea.scrollTop + 16) index = i;
    highlight(index);
  }, { passive: true });
  dialog.querySelector('.cv-close')!.addEventListener('click', () => dialog.close());
  returnButton.addEventListener('click', () => dialog.close());
  return () => { dialog.showModal(); readingArea.scrollTop = 0; highlight(0); sections[0].focus({ preventScroll: true }); };
}
