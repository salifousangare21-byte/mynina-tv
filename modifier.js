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

    // YouTube IDs
    content = content.replace(/youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/g, 'youtube.com/embed/EGTZOHqxdBk');
    content = content.replace(/playlist=[a-zA-Z0-9_-]{11}/g, 'playlist=EGTZOHqxdBk');

    // Remove #story block completely (dotall)
    content = content.replace(/<section\s+class="section"\s+id="story".*?<\/section>/gs, '');

    // Delete 'Watch Trailer' and 'Watch free teaser' CTAs
    content = content.replace(/<a[^>]*>(Watch Trailer|Watch free teaser)<\/a>\s*/g, '');

    // Unlock Episode 1 -> Unlock All Episodes Now
    content = content.replace(/Unlock Episode 1/g, 'Unlock All Episodes Now');

    // Replace <button type="submit"> text
    content = content.replace(/<button([^>]*)type="submit"([^>]*)>.*?<\/button>/g, '<button$1type="submit"$2 style="margin-top: 10px; width: 100%;">Watch All Episodes Now</button>');

    // Replace "Trailer band" in innocence
    content = content.replace(/Trailer band/g, 'Episode 1');

    // Change "Trailer" tag to "Episode 1"
    content = content.replace(/<div class="section-tag">Trailer<\/div>/g, '<div class="section-tag">Episode 1</div>');

    fs.writeFileSync(f, content, 'utf-8');
});

console.log('Update complete');
