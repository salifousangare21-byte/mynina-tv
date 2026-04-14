import os
import re

files = [
    'empire.html',
    'tangled-hearts.html',
    'a-life-worth-living.html',
    'lies-of-the-heart.html',
    'innocence.html'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Replace youtube IDs
    content = re.sub(r'youtube\.com/embed/[a-zA-Z0-9_-]{11}', 'youtube.com/embed/EGTZOHqxdBk', content)
    content = re.sub(r'playlist=[a-zA-Z0-9_-]{11}', 'playlist=EGTZOHqxdBk', content)

    # Delete `#story` section completely
    # We will search for <section ... id="story" ... </section>
    content = re.sub(r'<section\s+class="section"\s+id="story".*?</section>', '', content, flags=re.DOTALL)

    # Delete 'Watch Trailer' and 'Watch free teaser' CTAs
    content = re.sub(r'<a[^>]*>(Watch Trailer|Watch free teaser)</a>\s*', '', content)

    # Change "Unlock Episode 1" to "Unlock All Episodes Now"
    content = content.replace('Unlock Episode 1', 'Unlock All Episodes Now')

    # Re-word form call to action exactly as specified
    content = re.sub(
        r'<button([^>]*)type="submit"([^>]*)>.*?</button>',
        r'<button\1type="submit"\2 style="margin-top: 10px; width: 100%;">Watch All Episodes Now</button>',
        content
    )
    
    # In innocence, it was `<button class="btn-primary" type="submit">Continue to Baze</button>`
    content = re.sub(
        r'<button class="btn-primary" type="submit">[^<]*</button>',
        r'<button class="btn-primary" type="submit" style="margin-top: 10px; width: 100%;">Watch All Episodes Now</button>',
        content
    )
    
    # Change "Trailer" tag to "Episode 1"
    content = content.replace('<div class="section-tag">Trailer</div>', '<div class="section-tag">Episode 1</div>')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Update complete")
