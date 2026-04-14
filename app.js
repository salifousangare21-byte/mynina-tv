const MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/vjpqoop0c792pjxw3d4deyfo52ecs21s";
const DEFAULT_BAZE_URL = "https://www.safaricom.co.ke/personal/value-added-services/entertainment/baze";

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) {
    return;
  }

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

function getTrackingData() {
  const params = new URLSearchParams(window.location.search);
  const data = {};

  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
    const value = params.get(key) || "";
    if (value) {
      data[key] = value;
    }
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

async function postLead(payload) {
  const response = await fetch(MAKE_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Webhook error ${response.status}`);
  }
}

function initLeadForms() {
  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const button = form.querySelector("button[type='submit']");
      const status = form.querySelector("[data-form-status]");
      const redirectUrl = form.dataset.bazeUrl || DEFAULT_BAZE_URL;
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
      }
      const payload = {
        type: "mynina_baze_lead",
        campaign: form.dataset.campaign || "mynina-kenya-campaign",
        source: form.dataset.source || "mynina-kenya-page",
        series: form.querySelector("[name='series']")?.value || form.dataset.series || "MyNina on Baze",
        full_name: form.querySelector("[name='full_name']")?.value.trim() || "",
        phone: form.querySelector("[name='phone']")?.value.trim() || "",
        email: form.querySelector("[name='email']")?.value.trim() || "",
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

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((shell) => {
    const track = shell.querySelector("[data-carousel-track]");
    const prev = shell.querySelector("[data-carousel-prev]");
    const next = shell.querySelector("[data-carousel-next]");

    if (!track) {
      return;
    }

    const move = () => track.clientWidth;

    const goNext = () => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: move(), behavior: "smooth" });
      }
    };

    let autoInterval;
    const startAuto = () => {
      autoInterval = setInterval(goNext, 30000);
    };
    const resetAuto = () => {
      clearInterval(autoInterval);
      startAuto();
    };

    prev?.addEventListener("click", () => {
      if (track.scrollLeft <= 10) {
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      } else {
        track.scrollBy({ left: -move(), behavior: "smooth" });
      }
      resetAuto();
    });

    next?.addEventListener("click", () => {
      goNext();
      resetAuto();
    });

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

function initTasteFlow() {
  document.querySelectorAll("[data-taste-video]").forEach((video) => {
    const targetId = video.dataset.craveTarget;
    const cravePanel = targetId ? document.getElementById(targetId) : null;
    const note = cravePanel?.querySelector("[data-unlock-note]");

    if (!cravePanel) {
      return;
    }

    const unlock = () => {
      cravePanel.classList.add("is-visible");
      if (note) {
        note.textContent = "You unlocked the full episode. Leave your details and continue on Baze.";
      }
    };

    video.addEventListener("ended", unlock);

    const unlockBtn = document.querySelector(`[data-unlock-trigger="${targetId}"]`);
    unlockBtn?.addEventListener("click", unlock);
  });
}

// YouTube API Integration for auto-scrolling to lead form
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
    // Ensure iframe has an ID
    if (!iframe.id) {
      iframe.id = 'yt-player-' + index;
    }

    // Initialize YT Player
    const player = new YT.Player(iframe.id, {
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
    ytPlayers.push(player);

    // Setup custom poster click-to-play
    const parent = iframe.parentElement;
    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }
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
    // Find the signup/crave section
    const targetId = event.target.getIframe().dataset.ytTarget || 'signup';
    const signupSection = document.getElementById(targetId);

    if (signupSection) {
      // Scroll to the form
      signupSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight the form slightly to draw attention
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

      // If it's the crave panel (Innocence style), make it visible
      if (signupSection.classList.contains('locked-crave')) {
        signupSection.classList.add('is-visible');
        const note = signupSection.querySelector('[data-unlock-note]');
        if (note) note.textContent = "You unlocked the full episode. Leave your details and continue on Baze.";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initCarousels();
  initTasteFlow();
  initLeadForms();

  if (document.querySelectorAll('iframe[data-yt-lead]').length > 0) {
    loadYouTubeAPI();
  }
});
