const fs = require('fs');

const map = {
    'empire.html': 'empire.jpg',
    'tangled-hearts.html': 'tangled-hearts.jpg',
    'a-life-worth-living.html': 'a-life-worth-living.jpg',
    'lies-of-the-heart.html': 'lies-of-the-heart.jpg',
    'innocence.html': 'innocence.jpg'
};

Object.keys(map).forEach(f => {
    let content = fs.readFileSync(f, 'utf-8');

    // Perfectly force the top section head to match exact user spacing demands
    content = content.replace(/<div class="section-head reveal"[\s\S]*?<\/div>(\s*(<div class="reveal"|<div class="taste-layout"|<div class="trailer-panel reveal"))/,
        `<div class="section-head reveal" style="text-align: center; margin: 0 auto 36px; max-width: 800px; display: flex; flex-direction: column; align-items: center;">
          <div class="section-tag" style="margin-bottom: 12px; align-self: center;">Full Episode 1</div>
          <h2 class="section-title" style="margin-bottom: 16px; text-align: center;"><span style="display:inline-block">Dive into the Drama.</span><br><span style="display:inline-block">Watch the <em>First Episode</em> below.</span></h2>
          <p class="section-copy" style="text-align: center; margin: 0 auto; line-height: 1.6; font-size: 1.15rem; color: rgba(255,255,255,0.8); max-width: 700px;">
            Don't miss the explosive premiere. Press play to experience the full first episode right here, right now in stunning HD.<br>Once you're hooked, you can unlock the rest of the season instantly!
          </p>
        </div>$1`);

    // Inject the poster div OVER the iframe
    if (!content.includes('custom-video-poster')) {
        content = content.replace(/(<iframe data-yt-lead="true"[^>]*>)/g,
            `<div class="custom-video-poster" style="position: absolute; top:0; left:0; width:100%; height:100%; background-image: url('./assets/${map[f]}'); background-size: cover; background-position: top center; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;">
           <div class="play-button" style="width: 80px; height: 80px; background: rgba(255, 22, 93, 0.95); border-radius: 50%; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: transform 0.2s; box-shadow: 0 10px 40px rgba(255, 22, 93, 0.5);" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="white" style="margin-left:5px;"><path d="M8 5v14l11-7z"/></svg>
           </div>
        </div>\n          $1`);
    }

    fs.writeFileSync(f, content, 'utf-8');
});
console.log('Posters and texts adapted');
