"""Native Messaging host: transcribes one WhatsApp voice message and exits.

The browser starts this process for every chrome.runtime.sendNativeMessage
call, so the speech model is in memory only while a transcription runs.
Each message is a 4-byte native-endian length followed by UTF-8 JSON:
request {"audio": "<base64 ogg/opus>"}, reply {"text": ...} or {"error": ...}.
"""

import base64
import contextlib
import json
import os
import struct
import sys
import tempfile

MODEL = "mlx-community/Qwen3-ASR-1.7B-8bit"
LANGUAGE = "Italian"


def read_message(stream):
    header = stream.read(4)
    if len(header) != 4:
        raise EOFError("no message from the browser")
    (length,) = struct.unpack("=I", header)
    return json.loads(stream.read(length))


def write_message(stream, message):
    data = json.dumps(message).encode()
    stream.write(struct.pack("=I", len(data)) + data)
    stream.flush()


def transcribe(audio):
    from mlx_audio.stt import load  # slow import (MLX): only pay for it when there is audio

    # mlx_audio decodes ogg/opus through ffmpeg, which wants a file path.
    with tempfile.NamedTemporaryFile(suffix=".ogg") as file:
        file.write(audio)
        file.flush()
        result = load(MODEL).generate(file.name, language=LANGUAGE)
    return result.text.strip()


def handle(request):
    try:
        return {"text": transcribe(base64.b64decode(request["audio"], validate=True))}
    except Exception as err:
        return {"error": str(err) or type(err).__name__}


def main():
    # The model is downloaded by install.sh: never touch the network from here.
    os.environ["HF_HUB_OFFLINE"] = "1"
    frames = sys.stdout.buffer
    # Anything a library prints on stdout would corrupt the frames.
    with contextlib.redirect_stdout(sys.stderr):
        reply = handle(read_message(sys.stdin.buffer))
    write_message(frames, reply)


if __name__ == "__main__":
    main()
