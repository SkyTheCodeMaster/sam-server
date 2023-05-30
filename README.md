smol webserver that hosts an instance of sam-js

POST /tts:
```json
{
  "text": "texttexttext",
  "type": 1, // 1 returns a Uint8Array, 2 returns a Float32Array
  "voice": "SAM", // default sam, look at sam-js readme for different voice names.
}
```