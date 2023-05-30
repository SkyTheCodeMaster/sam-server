import SamJs from "sam-js";

import express, { Application, Request, Response } from 'express';

import bodyParser from 'body-parser';

import { WaveFile } from 'wavefile';

const port: number = 12500;

const app: Application = express();
app.use(bodyParser.json())

const voices: any = {
  "sam":               new SamJs({"mouth":128,"throat":128,"pitch":64,"speed":72}),
  "extra-terrestrial": new SamJs({"mouth":150,"throat":200,"pitch":64,"speed":100}),
  "little-old-lady":   new SamJs({"mouth":145,"throat":145,"pitch":32,"speed":82}),
  "stuffy-guy":        new SamJs({"mouth":105,"throat":110,"pitch":72,"speed":82}),
  "little-robot":      new SamJs({"mouth":190,"throat":190,"pitch":60,"speed":92}),
  "elf":               new SamJs({"mouth":160,"throat":110,"pitch":64,"speed":72}),
}

const make_talk = function(voice_name: String, type: number): CallableFunction {
  // Voice here is a string pointing back to the voices table.
  const voice = voices[voice_name.toLowerCase()];
  const inner = function(text: string): any {
    if (type == 1) {
      return voice.buf8(text);
    } else if (type == 2) {
      return voice.buf32(text);
    }
  }
  return inner;
}

app.get("/", (req: Request, res: Response) => {
  res.send(
    "Simple TTS API<br>" +
    "POST to /tts with below payload for voice<br>" +
    "GET to /voices for list of voices.<br>" +
    "<br>Payload:<br>" +
    "{<br>" +
    "  voice: str = 'sam',<br>" +
    "  arr_type: number = 1,<br>" +
    "  text: str<br>" +
    "}<br>" +
    "<br> arr_type is the kind of data returned. 1 = Uint8 array wav, 2 = Ufloat32 array wav"
  );
})

app.get("/voices", (req: Request, res: Response) => {
  const l: Array<string> = new Array<string>();
  for (const voice in voices) {
    l.push(voice);
  }
  res.send(JSON.stringify(l));
})

app.post("/tts", (req: Request, res: Response) => {
  // Pull apart the body
  const voice_name: string = req.body["voice"] || "sam";
  const arr_type:   number = req.body["type"]  || 1;
  const text:       string = req.body["text"];

  // Figure out the function we want to use
  const gen: CallableFunction = make_talk(voice_name,arr_type);

  // Generate the data
  const audio_bytes: any = gen(text);

  // Pull it from a dictionary into an array
  const audio_arr: Array<number> = Array.from(audio_bytes);

  // Convert it into a wav file
  let wav: WaveFile = new WaveFile()
  let depth: string = arr_type == 1 ? '8' : '32';
  wav.fromScratch(1, 24000, depth, audio_arr);

  // Spit it out to the response
  const audio_data = wav.toBuffer();

  res.setHeader("Content-Type","audio/x-wav")
  res.write(audio_data)
  res.end();
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
})