// Adds a "Trascrivi" button under every WhatsApp Web voice message and shows
// the transcript in its place. Audio comes from page.js (page world), text from
// the native host through background.js; transcripts are cached by message id.

const VOICE_ICON = '[data-icon="ptt-status"]';
const BOX_CLASS = 'wa-transcribe';

// WhatsApp re-renders rows on scroll and chat switch, dropping our box:
// rescanning on every mutation puts it back (from cache once transcribed).
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
scan();

function scan() {
  for (const icon of document.querySelectorAll(VOICE_ICON)) {
    const row = icon.closest('[data-id]');
    // The first child of the container is the bubble that carries the background.
    const bubble = row?.querySelector('[data-testid="msg-container"]')?.firstElementChild;
    if (bubble && !bubble.querySelector('.' + BOX_CLASS)) attach(row.dataset.id, bubble);
  }
}

async function attach(id, bubble) {
  // Append before awaiting storage, so overlapping scans see the box.
  const box = document.createElement('div');
  box.className = BOX_CLASS;
  bubble.append(box);
  try {
    const cached = (await chrome.storage.local.get(id))[id];
    if (cached !== undefined) showText(box, cached);
    else showButton(id, box, 'Trascrivi');
  } catch {
    // After the extension is reloaded or updated, scripts already in the page
    // lose access to it until the page itself is reloaded.
    box.textContent = 'wa-transcribe è stato aggiornato: ricarica la pagina';
  }
}

function showButton(id, box, label, error) {
  const button = element('button', 'button', label);
  button.type = 'button';
  button.addEventListener('click', (event) => {
    event.stopPropagation(); // keep WhatsApp from treating it as a click on the bubble
    transcribe(id, box);
  });
  box.replaceChildren(button);
  if (error) box.append(element('div', 'error', error));
}

function showText(box, text) {
  box.replaceChildren(element('div', 'text', text || '(nessun parlato riconosciuto)'));
}

function element(tag, name, text) {
  const node = document.createElement(tag);
  node.className = `${BOX_CLASS}__${name}`;
  node.textContent = text;
  return node;
}

async function transcribe(id, box) {
  box.replaceChildren(element('div', 'status', 'Trascrizione in corso…'));
  try {
    const audio = await requestAudio(id);
    const reply = await chrome.runtime.sendMessage({ audio });
    if (reply.error) throw new Error(reply.error);
    await chrome.storage.local.set({ [id]: reply.text });
    showText(box, reply.text);
  } catch (err) {
    showButton(id, box, 'Riprova', err.message);
  }
}

function requestAudio(id) {
  return new Promise((resolve, reject) => {
    window.addEventListener('message', function onReply(event) {
      if (event.source !== window || event.data?.type !== 'wa-transcribe:audio' || event.data.id !== id) return;
      window.removeEventListener('message', onReply);
      if (event.data.error) reject(new Error(event.data.error));
      else resolve(event.data.base64);
    });
    window.postMessage({ type: 'wa-transcribe:get-audio', id }, location.origin);
  });
}
