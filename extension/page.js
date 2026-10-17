// Runs in the page world next to wa-js. content.js asks for a voice message by
// the id WhatsApp Web puts on its DOM row; we reply with the decrypted audio.
// downloadMedia only fetches and decrypts: it never marks the message as played.

window.addEventListener('message', async (event) => {
  if (event.source !== window || event.data?.type !== 'wa-transcribe:get-audio') return;
  const { id } = event.data;
  const reply = { type: 'wa-transcribe:audio', id };
  try {
    reply.base64 = await voiceAudio(id);
  } catch (err) {
    reply.error = err.message || String(err);
  }
  window.postMessage(reply, location.origin);
});

async function voiceAudio(id) {
  if (!WPP.isReady) throw new Error('WhatsApp Web non è ancora pronto, riprova tra qualche secondo');
  // DOM rows carry only the bare message id: the full key (chat + sender) lives
  // on the message model of the open chat.
  const msg = WPP.chat.getActiveChat()?.msgs.getModelsArray().find((m) => m.id.id === id);
  if (!msg) throw new Error('messaggio non trovato: forse va aggiornato wppconnect-wa.js');
  return blobToBase64(await WPP.chat.downloadMedia(msg.id._serialized));
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
