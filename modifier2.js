const fs = require('fs');

const files = [
    'empire.html',
    'tangled-hearts.html',
    'a-life-worth-living.html',
    'lies-of-the-heart.html',
    'innocence.html'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf-8');

    // Replace test IDs with the latest requested
    content = content.replace(/(aQbbjOEbJZY|EGTZOHqxdBk)/g, 'vNzFBpWIgcE');

    // standard section-head (the 4 normal files)
    content = content.replace(
        /<div class="section-head reveal"[\s\S]*?<\/div>(\s*)<div class="reveal"/,
        `<div class="section-head reveal" style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 32px;">
          <div class="section-tag">Full Episode 1</div>
          <h2 class="section-title">Dive into the Drama. Watch the <em>First Episode</em> below.</h2>
          <p class="section-copy" style="text-align: center; max-width: 600px; margin: 16px auto 0; font-size: 1.15rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
            Don't miss the explosive premiere. Press play to experience the full first episode right here, right now in stunning HD. Once you're hooked, you can unlock the rest of the season instantly!
          </p>
        </div>$1<div class="reveal"`
    );

    // Innocence "Free preview" head adaptation
    content = content.replace(
        /<div class="section-head reveal">\s*<div class="section-tag">Free preview<\/div>[\s\S]*?<\/p>\s*<\/div>/,
        `<div class="section-head reveal" style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 32px;">
          <div class="section-tag">Full Episode 1</div>
          <h2 class="section-title">Dive into the Drama. Watch the <em>First Episode</em> below.</h2>
          <p class="section-copy" style="text-align: center; max-width: 600px; margin: 16px auto 0; font-size: 1.15rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6;">
            Don't miss the explosive premiere. Press play to experience the full first episode right here, right now in stunning HD. Once you're hooked, you can unlock the rest of the season instantly!
          </p>
        </div>`
    );

    // Form CTA fix
    content = content.replace(/Watch all episodes/ig, 'Watch All Episodes Now');
    content = content.replace(/Watch All Episodes Now Now/ig, 'Watch All Episodes Now'); // Just in case of doubles
    content = content.replace(/Continue to Baze/ig, 'Watch All Episodes Now');

    fs.writeFileSync(f, content, 'utf-8');
});

console.log('Update complete');
