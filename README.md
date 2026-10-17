# wa-transcribe

Transcribe WhatsApp Web voice messages on your own Mac. A button under each
voice message sends its audio to [MLX Whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
running locally and shows the text in its place.

Unofficial project, not affiliated with WhatsApp or Meta.

- **Local only.** Audio and transcripts never leave your machine.
- **On demand.** Nothing runs until you click. The browser starts the
  transcriber for that message and it exits right after, so the ~3 GB model
  is not kept in memory.
- **Silent.** Audio is read through [wa-js](https://github.com/wppconnect-team/wa-js)
  without playing it, so the sender does not see the message as played.
- **Cached.** A transcribed message shows its text immediately the next time.

## Requirements

- macOS on Apple Silicon
- Brave or Google Chrome
- `ffmpeg` (`brew install ffmpeg`) and `python3`

## Install

```sh
./install.sh
```

The script installs `mlx-whisper` in `~/.venvs/whisper` (override with
`WHISPER_VENV`) if it is missing, downloads the model, and registers the
native messaging host for Brave and Chrome.

Then open `brave://extensions` (or `chrome://extensions`), enable
*Developer mode*, choose *Load unpacked*, select the `extension` folder and
reload WhatsApp Web.

## Usage

Click **Trascrivi** under a voice message. The first transcription takes a few
seconds while the model loads.

Transcription is set to Italian. To change the language or model, edit
`LANGUAGE` and `MODEL` in `host/wa_transcribe.py`.

## How it works

```
content.js ──postMessage──▶ page.js (wa-js, page world): download + decrypt
     │
     └──runtime.sendMessage──▶ background.js ──sendNativeMessage──▶ host/wa_transcribe.py
```

Transcripts are stored in the extension's local storage, keyed by message id.

## Troubleshooting

- *Specified native messaging host not found*: run `./install.sh` again and
  restart the browser.
- *messaggio non trovato*: WhatsApp Web changed its internals. Replace
  `extension/wppconnect-wa.js` with the latest `dist/wppconnect-wa.js` from
  [@wppconnect/wa-js](https://www.npmjs.com/package/@wppconnect/wa-js).

## Uninstall

Remove the extension, then delete `wa_transcribe.json` from
`~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/`
and `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`.

## License

MIT, see [LICENSE](LICENSE). `extension/wppconnect-wa.js` is
[wa-js](https://github.com/wppconnect-team/wa-js) v4.7.1, licensed under
Apache-2.0 ([extension/LICENSE-wa-js](extension/LICENSE-wa-js)); its bundled
third-party notices are in `extension/wppconnect-wa.js.LICENSE.txt`.
