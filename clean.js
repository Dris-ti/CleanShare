const TRACKING_PARAMS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^igshid$/i,
  /^mc_eid$/i,
  /^mc_cid$/i,
  /^_ga$/i,
  /^_gl$/i,
  /^yclid$/i,
  /^msclkid$/i,
  /^dclid$/i,
  /^oly_enc_id$/i,
  /^oly_anon_id$/i,
  /^vero_id$/i,
  /^wickedid$/i,
  /^s_cid$/i,
  /^mkt_tok$/i,
  /^elqTrackId$/i,
  /^elqTrack$/i,
];

function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : text;
}

function cleanUrl(raw) {
  try {
    const url = new URL(extractUrl(raw));
    const params = url.searchParams;
    const keys = [...params.keys()];
    for (const key of keys) {
      if (TRACKING_PARAMS.some((re) => re.test(key))) {
        params.delete(key);
      }
    }
    url.search = params.toString();
    return url.toString();
  } catch {
    return raw;
  }
}

const input = document.getElementById("input");
const output = document.getElementById("output");
const cleanBtn = document.getElementById("clean");
const copyBtn = document.getElementById("copy");

cleanBtn.addEventListener("click", () => {
  output.textContent = cleanUrl(input.value);
});

copyBtn.addEventListener("click", async () => {
  const text = output.textContent || input.value;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
  } catch {
    // Fallback: select the text
    const range = document.createRange();
    range.selectNodeContents(output);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
});
