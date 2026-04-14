const fs = require('fs');
const files = ['empire.html', 'tangled-hearts.html', 'a-life-worth-living.html', 'lies-of-the-heart.html', 'innocence.html'];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf-8');

    // Replace the exact section head we injected last time
    content = content.replace(
        /<div class="section-head reveal"[^>]*>[\s\S]*?<\/div>(\s*(<div class="reveal"|<div class="taste-layout"|<div class="trailer-panel reveal"))/,
        `<div class="section-head reveal" style="text-align: center; margin: 0 auto 36px; width: 100%;">
          <div class="section-tag" style="display: inline-block; margin-bottom: 12px;">Full Episode 1</div>
          <h2 class="section-title" style="margin: 0; text-align: center;">Dive into the Drama.<br>Watch the <em>First Episode</em> below.</h2>
        </div>$1`
    );

    fs.writeFileSync(f, content, 'utf-8');
});

console.log('Centering fixed');
