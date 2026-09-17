const TRACKING_PARAMS = [
  /^utm_/i, /^fbclid$/i, /^gclid$/i, /^igshid$/i, /^mc_eid$/i,
  /^mc_cid$/i, /^_ga$/i, /^_gl$/i, /^yclid$/i, /^msclkid$/i,
  /^dclid$/i, /^oly_enc_id$/i, /^oly_anon_id$/i, /^vero_id$/i,
  /^wickedid$/i, /^s_cid$/i, /^mkt_tok$/i, /^elqTrackId$/i,
  /^elqTrack$/i,
];

// SVG Icon Templates
const ICONS = {
  copy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  cross: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
};

function extractUrl(text) {
  if (!text) return '';
  const m = String(text).match(/https?:\/\/[^\s]+/);
  return m ? m[0] : String(text).trim();
}

function cleanUrl(raw) {
  try {
    const url = new URL(extractUrl(raw));
    const params = url.searchParams;
    for (const key of [...params.keys()]) {
      if (TRACKING_PARAMS.some(re => re.test(key))) params.delete(key);
    }
    url.search = params.toString();
    return url.toString();
  } catch {
    return raw || '';
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

// Function to handle interactive button UI feedback states
function updateButtonFeedback(button, state) {
  if (state === 'success') {
    button.innerHTML = `${ICONS.check} Copied`;
    button.classList.add('btn-success');
  } else if (state === 'failed') {
    button.innerHTML = `${ICONS.cross} Failed`;
    button.classList.add('btn-failed');
  }

  // Reset back to default state after 2 seconds
  setTimeout(() => {
    button.innerHTML = `${ICONS.copy} Copy`;
    button.classList.remove('btn-success', 'btn-failed');
  }, 2000);
}

const input = document.getElementById('input');
const output = document.getElementById('output');
const status = document.getElementById('status');
const copyBtn = document.getElementById('copy');

// 1) Did we arrive from the Android share sheet?
const p = new URLSearchParams(location.search);
const incoming = p.get('url') || p.get('text') || p.get('title') || '';

if (incoming) {
  const cleaned = cleanUrl(incoming);
  input.value = incoming;
  output.value = cleaned;

  (async () => {
    const ok = await copyText(cleaned);
    if (ok) {
      status.textContent = 'Copied ✓ Paste it anywhere.';
      setTimeout(() => { try { window.close(); } catch {} }, 900);
    } else {
      status.innerHTML = '';
      const btn = document.createElement('button');
      btn.textContent = 'Tap to copy';
      btn.className = 'big-copy';
      btn.addEventListener('click', async () => {
        const done = await copyText(cleaned);
        status.textContent = done ? 'Copied ✓' : 'Copy failed — long-press to select';
        if (done) setTimeout(() => { try { window.close(); } catch {} }, 700);
      });
      status.appendChild(btn);
    }
  })();
} else {
  // Opened manually — show the paste-and-clean UI
  status.textContent = '';
  
  document.getElementById('clean').addEventListener('click', () => {
    const cleaned = cleanUrl(input.value);
    output.value = cleaned;
  });

  copyBtn.addEventListener('click', async () => {
    const textToCopy = output.value.trim() || input.value.trim();

    // Do nothing if there's no result or text to copy
    if (!textToCopy) return;

    const ok = await copyText(textToCopy);
    if (ok) {
      updateButtonFeedback(copyBtn, 'success');
    } else {
      updateButtonFeedback(copyBtn, 'failed');
    }
  });
}