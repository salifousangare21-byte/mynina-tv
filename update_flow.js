const fs = require('fs');

const redirects = {
    'empire.html': 'https://www.baze.co.ke/en/search?q=Empire&modal=true&type=series&id=796',
    'tangled-hearts.html': 'https://www.baze.co.ke/en/search?q=Tangled+Hearts&modal=true&type=series&id=774',
    'a-life-worth-living.html': 'https://www.baze.co.ke/en/search?q=A+Life+Worth+Living&modal=true&type=series&id=795',
    'lies-of-the-heart.html': 'https://www.baze.co.ke/en/search?q=Lies+Of+The+Heart&modal=true&type=series&id=780',
    'innocence.html': 'https://www.baze.co.ke/en/search?q=Innocence&modal=true&type=series&id=841'
};

Object.keys(redirects).forEach(f => {
    let content = fs.readFileSync(f, 'utf-8');

    // 1. Inject the data-baze-url attribute into the form
    content = content.replace(/<form\s+data-lead-form([^>]*)>/g, (match, p1) => {
        // Only inject if it doesn't already have one
        if (p1.includes('data-baze-url')) {
            return match;
        }
        return `<form data-lead-form data-baze-url="${redirects[f]}"${p1}>`;
    });

    // 2. Format the phone input
    // The previous HTML has: <input type="tel" name="phone"...> or <div class="field"><label>Phone</label><input name="phone" type="tel"...>
    // We will look for <input ... name="phone" ...> and wrap it!
    content = content.replace(/<input\s+([^>]*?)name="phone"([^>]*?)>/g, (match) => {
        // If it's already wrapped, skip
        if (match.includes('padding-left: 90px')) return match;

        let modifiedInput = match;

        // Remove existing placeholder and add ours
        modifiedInput = modifiedInput.replace(/placeholder="[^"]*"/, 'placeholder="7XX XXX XXX"');

        // Ensure class="form-input" if it was there is kept, but we add inline style
        // Actually, let's just forcefully append the style
        modifiedInput = modifiedInput.replace(/>$/, ' style="padding-left: 95px; width: 100%; box-sizing: border-box;">');

        return `<div class="phone-wrapper" style="position: relative; display: flex; align-items: center; width: 100%;">
  <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 1rem; color: #fff; pointer-events: none;">🇰🇪 +254</span>
  ${modifiedInput}
</div>`;
    });

    fs.writeFileSync(f, content, 'utf-8');
});

// 3. Update app.js
let appjs = fs.readFileSync('app.js', 'utf-8');

appjs = appjs.replace(
    /const MAKE_WEBHOOK_URL = ".*?";/,
    'const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/vjpqoop0c792pjxw3d4deyfo52ecs21s";'
);

appjs = appjs.replace(
    /if \(status\) \{\s*status\.textContent = "[^"]*";\s*\}/s,
    `if (status) {
        status.innerHTML = "<strong>Congratulations!</strong> You are being redirected to watch the series...";
        status.style.color = "var(--teal)";
        status.style.fontSize = "1rem";
        status.style.marginTop = "14px";
      }`
);

appjs = appjs.replace(
    /finally \{\s*window\.location\.href = redirectUrl;\s*\}/s,
    `finally {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      }`
);

fs.writeFileSync('app.js', appjs, 'utf-8');

console.log('Flow updated');
