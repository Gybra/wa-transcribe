# wa-transcribe

Transcribe WhatsApp Web voice messages on your own Mac. A button under each
voice message sends its audio to [Qwen3-ASR](https://huggingface.co/Qwen/Qwen3-ASR-1.7B),
running locally through [mlx-audio](https://github.com/Blaizzy/mlx-audio), and
shows the text in its place.

Unofficial project, not affiliated with WhatsApp or Meta.

- **Local only.** Audio and transcripts never leave your machine.
- **On demand.** Nothing runs until you click. The browser starts the
  transcriber for that message and it exits right after, so the ~2.5 GB model
  is not kept in memory.
- **Silent.** Audio is read through [wa-js](https://github.com/wppconnect-team/wa-js)
  without playing it, so the sender does not see the message as played.
- **Cached.** A transcribed message shows its text immediately the next time.

## Requirements

- macOS on Apple Silicon
- Brave or Google Chrome
- `ffmpeg` (`brew install ffmpeg`) and Python 3.10+ (`brew install python`)

## Install

```sh
./install.sh
```

The script creates the venv `~/.venvs/wa-transcribe` (override with
`WA_TRANSCRIBE_VENV`) if it is missing, installs the pinned `mlx-audio` version
in it, downloads the model, copies the native
messaging host to `~/Library/Application Support/wa-transcribe` and registers
it for Brave and Chrome. The copy is needed because the host inherits the
browser's macOS privacy permissions, which usually exclude Documents, Desktop
and Downloads. Run the script again after editing `host/wa_transcribe.py`.

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

- *Specified native messaging host not found* or *Native host has exited*:
  run `./install.sh` again and restart the browser.
- *messaggio non trovato*: WhatsApp Web changed its internals. Replace
  `extension/wppconnect-wa.js` with the latest `dist/wppconnect-wa.js` from
  [@wppconnect/wa-js](https://www.npmjs.com/package/@wppconnect/wa-js).

## Uninstall

Remove the extension and `~/Library/Application Support/wa-transcribe`, then
delete `wa_transcribe.json` from
`~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/`
and `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`.

## License

MIT, see [LICENSE](LICENSE). `extension/wppconnect-wa.js` is
[wa-js](https://github.com/wppconnect-team/wa-js) v4.7.1, licensed under
Apache-2.0 ([extension/LICENSE-wa-js](extension/LICENSE-wa-js)); its bundled
third-party notices are in `extension/wppconnect-wa.js.LICENSE.txt`.
