import fs from 'fs';
const files = ['index.html', 'faq.html', 'confidentialite.html', 'cgv.html', 'cgu.html', 'booking.html', 'repreneurs.html'];

files.forEach(f => {
    try {
        let text = fs.readFileSync(f, 'utf8');
        text = text.replace(/<link rel="stylesheet" href="\/src\/style-b2c\.css">/g, '<link rel="stylesheet" href="style-b2b.css">');
        text = text.replace(/<script type="module" src="\/src\/main-b2c\.js"><\/script>/g, '');
        text = text.replace(/<script type="module" src="\/main\.js"><\/script>/g, '<script type="module" src="main.js"></script>');
        fs.writeFileSync(f, text);
    } catch (e) {
        console.log("Error on ", f, e.message);
    }
});
console.log("Paths fixed!");
