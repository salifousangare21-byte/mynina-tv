import fs from 'fs';

const src = 'C:/Users/salifou/OneDrive - COTE OUEST ABIDJAN/Bureau/Landing Page Prise de Rendez vous - Copie/index.html';
const dest = 'C:/Users/salifou/OneDrive - COTE OUEST ABIDJAN/Bureau/Landing Page MyNina - Baze - Copie/mynina-kenya-campaign/index.html';

let content = fs.readFileSync(src, 'utf8');

// Replace any Vite dev-style references with style.css to match the user's specific request
content = content.replace(/href="\/src\/style-b2c\.css"/g, 'href="style.css"');
// Fallback if they were already style.css
content = content.replace(/href="style\.css"/g, 'href="style.css"');

fs.writeFileSync(dest, content);
console.log("Done.");
