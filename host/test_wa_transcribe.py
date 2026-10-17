import base64
import io
import unittest
from unittest import mock

import wa_transcribe


class FramingTest(unittest.TestCase):
    def test_round_trip(self):
        stream = io.BytesIO()
        wa_transcribe.write_message(stream, {"text": "ciao è tutto ok"})
        stream.seek(0)
        self.assertEqual(wa_transcribe.read_message(stream), {"text": "ciao è tutto ok"})

    def test_empty_input_is_an_error(self):
        with self.assertRaises(EOFError):
            wa_transcribe.read_message(io.BytesIO(b""))


class HandleTest(unittest.TestCase):
    def test_decodes_audio_and_returns_text(self):
        with mock.patch.object(wa_transcribe, "transcribe", return_value="ciao") as transcribe:
            reply = wa_transcribe.handle({"audio": base64.b64encode(b"OggS").decode()})
        transcribe.assert_called_once_with(b"OggS")
        self.assertEqual(reply, {"text": "ciao"})

    def test_failures_become_error_replies(self):
        self.assertIn("error", wa_transcribe.handle({}))
        self.assertIn("error", wa_transcribe.handle({"audio": "not base64!"}))


if __name__ == "__main__":
    unittest.main()
