const fs = require('fs');

const files = [
    'empire.html',
    'tangled-hearts.html',
    'a-life-worth-living.html',
    'lies-of-the-heart.html',
    'innocence.html'
];

const headTags = `
  <!-- Google tag (gtag.js) GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-M19H3ESPMF"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-M19H3ESPMF');
  </script>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-W4LMJS5');</script>
  <!-- End Google Tag Manager -->
</head>`;

const bodyTags = `<body>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-W4LMJS5"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->`;

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf-8');

    // Prevent duplicate injection
    if (!content.includes('G-M19H3ESPMF')) {
        content = content.replace(/(<\/head>)/i, headTags);
        content = content.replace(/(<body>)/i, bodyTags);
        fs.writeFileSync(f, content, 'utf-8');
    }
});

let appjs = fs.readFileSync('app.js', 'utf-8');
if (!appjs.includes('bazeUrlObj')) {
    appjs = appjs.replace(
        /const redirectUrl = form\.dataset\.bazeUrl \|\| DEFAULT_BAZE_URL;/,
        `const redirectUrl = form.dataset.bazeUrl || DEFAULT_BAZE_URL;
      let finalRedirectUrl = redirectUrl;
      if (window.location.search) {
         try {
           const bazeUrlObj = new URL(redirectUrl);
           const urlParams = new URLSearchParams(window.location.search);
           urlParams.forEach((value, key) => {
             bazeUrlObj.searchParams.set(key, value);
           });
           finalRedirectUrl = bazeUrlObj.toString();
         } catch(e) {}
      }`
    );

    // Replace the redirect string inside the finally block
    appjs = appjs.replace(/window\.location\.href = redirectUrl;/g, 'window.location.href = finalRedirectUrl;');
    fs.writeFileSync('app.js', appjs, 'utf-8');
}

console.log('Tracking installed');
