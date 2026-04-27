const MAKE_WEBHOOK_URL = "https://mynina-baze-webhook.marketing-03f.workers.dev";
const DEFAULT_BAZE_URL = "https://www.safaricom.co.ke/personal/value-added-services/entertainment/baze";
const STORAGE_KEY = "mynina_baze_emails";

// ── Anti-doublon email ──
function emailAlreadyUsed(email) {
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return list.includes(email.toLowerCase().trim());
}

function rememberEmail(email) {
  const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!list.includes(email.toLowerCase().trim())) {
    list.push(email.toLowerCase().trim());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

// ── Reveal au scroll ──
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  items.forEach((item) => observer.observe(item));
}

// ── Données de tracking UTM ──
function getTrackingData() {
  const params = new URLSearchParams(window.location.search);
  const data = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    const value = params.get(key) || "";
    if (value) data[key] = value;
  });
  return {
    page_url: window.location.href,
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || "en",
    ...data
  };
}

// ── Envoi webhook ──
async function postLead(payload) {
  const response = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Webhook error ${response.status}`);
}

// ── Modale doublon ──
function showDuplicateModal(bazeUrl) {
  const existing = document.getElementById("mynina-duplicate-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "mynina-duplicate-modal";
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(9,5,16,0.85);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div style="
      background: #1e0c21;
      border: 1px solid rgba(255,22,93,0.3);
      border-radius: 20px;
      padding: 40px 32px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    ">
      <div style="font-size: 2.5rem; margin-bottom: 16px;">🎬</div>
      <h3 style="
        color: #fff;
        font-family: 'Playfair Display', serif;
        font-size: 1.6rem;
        margin-bottom: 16px;
        line-height: 1.3;
      ">You are already a MyNina customer on Baze!</h3>
      <p style="
        color: rgba(255,255,255,0.75);
        font-size: 1rem;
        line-height: 1.6;
        margin-bottom: 28px;
      ">Go to Baze to watch all episodes.</p>
      <a href="${bazeUrl}" target="_blank" style="
        display: inline-block;
        background: #ff165d;
        color: #fff;
        font-weight: 700;
        font-size: 1rem;
        padding: 14px 32px;
        border-radius: 50px;
        text-decoration: none;
        margin-bottom: 16px;
        transition: opacity 0.2s;
      " onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        ▶ Watch on Baze
      </a>
      <br>
      <button onclick="document.getElementById('mynina-duplicate-modal').remove()" style="
        background: none;
        border: none;
        color: rgba(255,255,255,0.4);
        font-size: 0.85rem;
        cursor: pointer;
        margin-top: 8px;
        padding: 4px 8px;
      ">Close</button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });
}

// ── Formulaires lead ──
function initLeadForms() {
  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector("[data-form-status]");
      const redirectUrl = form.dataset.bazeUrl || DEFAULT_BAZE_URL;

      // Construire l'URL finale avec UTM
      let finalRedirectUrl = redirectUrl;
      if (window.location.search) {
        try {
          const bazeUrlObj = new URL(redirectUrl);
          const urlParams = new URLSearchParams(window.location.search);
          urlParams.forEach((value, key) => bazeUrlObj.searchParams.set(key, value));
          finalRedirectUrl = bazeUrlObj.toString();
        } catch(e) {}
      }

      const email = form.querySelector("[name='email']")?.value.trim() || "";

      // ── Vérification doublon email ──
      if (emailAlreadyUsed(email)) {
        showDuplicateModal(finalRedirectUrl);
        return;
      }

      // Récupérer valeur Safaricom
      const safaricomField = form.querySelector("[name='safaricom_customer']");
      const safaricomValue = (safaricomField && safaricomField.value) ? safaricomField.value : "Not specified";

      const payload = {
        type: "mynina_baze_lead",
        campaign: form.dataset.campaign || "mynina-kenya-campaign",
        source: form.dataset.source || "mynina-kenya-page",
        series: form.querySelector("[name='series']")?.value || form.dataset.series || "MyNina on Baze",
        full_name: form.querySelector("[name='full_name']")?.value.trim() || "",
        phone: form.querySelector("[name='phone']")?.value.trim() || "",
        email: email,
        safaricom_customer: safaricomValue,
        ...getTrackingData()
      };

      if (status) {
        status.innerHTML = "<strong>Congratulations!</strong> You are being redirected to watch the series...";
        status.style.color = "var(--teal)";
        status.style.fontSize = "1rem";
        status.style.marginTop = "14px";
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Opening Baze...";
      }

      // Mémoriser l'email
      rememberEmail(email);

      try {
        await postLead(payload);
      } catch (error) {
        console.error("Lead webhook error:", error);
      } finally {
        setTimeout(() => {
          window.location.href = finalRedirectUrl;
        }, 2000);
      }
    });
  });
}

// ── Carrousels ──
function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((shell) => {
    const track = shell.querySelector("[data-carousel-track]");
    const prev = shell.querySelector("[data-carousel-prev]");
    const next = shell.querySelector("[data-carousel-next]");
    if (!track) return;

    const move = () => track.clientWidth;
    const goNext = () => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: move(), behavior: "smooth" });
      }
    };

    let autoInterval;
    const startAuto = () => { autoInterval = setInterval(goNext, 30000); };
    const resetAuto = () => { clearInterval(autoInterval); startAuto(); };

    prev?.addEventListener("click", () => {
      if (track.scrollLeft <= 10) {
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      } else {
        track.scrollBy({ left: -move(), behavior: "smooth" });
      }
      resetAuto();
    });

    next?.addEventListener("click", () => { goNext(); resetAuto(); });
    startAuto();

    track.querySelectorAll(".series-thumb").forEach((thumb) => {
      const video = thumb.querySelector("video");
      const btn = thumb.querySelector(".mute-toggle");
      if (video && btn) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          video.muted = !video.muted;
          btn.textContent = video.muted ? "🔇" : "🔊";
        });
      }
    });
  });
}

// ── Taste flow ──
function initTasteFlow() {
  document.querySelectorAll("[data-taste-video]").forEach((video) => {
    const targetId = video.dataset.craveTarget;
    const cravePanel = targetId ? document.getElementById(targetId) : null;
    const note = cravePanel?.querySelector("[data-unlock-note]");
    if (!cravePanel) return;

    const unlock = () => {
      cravePanel.classList.add("is-visible");
      if (note) note.textContent = "You unlocked the full episode. Leave your details and continue on Baze.";
    };

    video.addEventListener("ended", unlock);
    document.querySelector(`[data-unlock-trigger="${targetId}"]`)?.addEventListener("click", unlock);
  });
}

// ── YouTube API ──
let ytPlayers = [];

function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  if (firstScriptTag) {
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  } else {
    document.head.appendChild(tag);
  }
}

window.onYouTubeIframeAPIReady = function () {
  const iframes = document.querySelectorAll('iframe[data-yt-lead]');
  iframes.forEach((iframe, index) => {
    if (!iframe.id) iframe.id = 'yt-player-' + index;

    const player = new YT.Player(iframe.id, {
      events: { 'onStateChange': onPlayerStateChange }
    });
    ytPlayers.push(player);

    const parent = iframe.parentElement;
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

    const poster = parent.querySelector('.custom-video-poster');
    if (poster) {
      poster.addEventListener('click', () => {
        poster.style.display = 'none';
        player.playVideo();
      });
    }
  });
};

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    const targetId = event.target.getIframe().dataset.ytTarget || 'signup';
    const signupSection = document.getElementById(targetId);
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const form = signupSection.querySelector('form');
      if (form) {
        setTimeout(() => {
          form.style.transform = 'scale(1.03)';
          form.style.transition = 'transform 0.4s ease';
          form.style.boxShadow = '0 0 40px rgba(183, 114, 255, 0.4)';
          setTimeout(() => {
            form.style.transform = 'scale(1)';
            form.style.boxShadow = 'none';
          }, 800);
        }, 500);
      }
      if (signupSection.classList.contains('locked-crave')) {
        signupSection.classList.add('is-visible');
        const note = signupSection.querySelector('[data-unlock-note]');
        if (note) note.textContent = "You unlocked the full episode. Leave your details and continue on Baze.";
      }
    }
  }
}

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initCarousels();
  initTasteFlow();
  initLeadForms();
  if (document.querySelectorAll('iframe[data-yt-lead]').length > 0) {
    loadYouTubeAPI();
  }
});
/ /   v 2  
 