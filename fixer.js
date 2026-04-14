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

    // Fix the multi-line submit buttons which the previous script missed due to lack of /s modifier
    content = content.replace(/<button([^>]*)type="submit"([^>]*)>[\s\S]*?<\/button>/g, '<button$1type="submit"$2>Watch All Episodes Now</button>');

    // Scrub any stray instances of old text spanning multiple lines
    content = content.replace(/Watch Episode\s+1\s+Now/g, 'Watch All Episodes Now');
    content = content.replace(/Unlock Episode\s+1/g, 'Unlock All Episodes Now');
    content = content.replace(/I want the full episode/g, 'Unlock All Episodes Now');

    // Also ensuring no duplicated "Watch All Episodes Now Now" strings left
    content = content.replace(/Watch All Episodes Now\s+Now/g, 'Watch All Episodes Now');

    fs.writeFileSync(f, content, 'utf-8');
});

console.log('Fix complete');
