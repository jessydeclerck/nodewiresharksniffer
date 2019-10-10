const { spawn } = require("child_process");
const oboe = require("oboe");
const _ = require("lodash");
const axios = require("axios");
import { readMsgId } from "./payloadReader";
import { msgIds, msgName } from "./neededMsg";
/**
 * on Linux, Unix, *BSD you can use

tshark -ni any

on Windows, any does not work, so you'll have to specify the interface ID or number

tshark -ni 1 -ni 2 -ni 3 (this will work on Linux, Unix, *BSD as well)

You can get the interface number with

dumpcap -D -M
 */
const tsharkParams = [
  "-T",
  "json",
  "-ni",
  "any",
  "-e",
  "tcp.srcport",
  "-e",
  "tcp.payload",
  "-o",
  "tcp.desegment_tcp_streams:false",
  "port",
  "5555"
];
let tsharkProcess;

tsharkProcess = spawn("tshark", tsharkParams);

tsharkProcess.on("error", err => {
  console.error("error while starting tshark", err);
});

oboe(tsharkProcess.stdout).node("layers", async data => {
  let srcport = data["tcp.srcport"];
  let payload = data["tcp.payload"];
  console.log(`src port ${srcport}`);
  if (payload) {
    let dataPayload = payload[0].replace(/:/g, "");
    let msgId = readMsgId(dataPayload);
    if (!msgIds.includes(msgId)) return;
    let context = getContext(srcport);
    let decodedMessage = decodePayload(payload, context);
    console.log(`${decodedMessage}`);
  }

  console.log("\n");
});

tsharkProcess.stderr.pipe(process.stdout);

tsharkProcess.on("close", code => {
  console.log(`child process exited with code ${code}`);
});

async function decodePayload(payload, context) {
  let response;
  try {
    response = await axios.post(
      "https://webd2decoder.herokuapp.com/decoder/".concat(context),
      dataPayload
    );
    console.log(`${response.data}`);
  } catch (err) {
    console.error(`error ${dataPayload}`);
  }
  return response.data;
}

function getContext(srcport) {
  let context = "fromclient";
  if (srcport == 5555) {
    context = "fromserver";
  }
  return context;
}
