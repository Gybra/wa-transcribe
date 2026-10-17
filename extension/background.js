// Forwards audio from content.js to the native host. The browser starts the
// host for each message and it exits after replying, so the Whisper model only
// occupies memory while a transcription runs.

const HOST = 'wa_transcribe';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  chrome.runtime.sendNativeMessage(HOST, { audio: message.audio })
    .then(sendResponse, (err) => sendResponse({ error: err.message }));
  return true; // reply asynchronously
});
