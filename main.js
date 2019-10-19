const { spawn } = require("child_process");
const axios = require("axios");
const payloadReader = require("./payloadReader");
const msgIds = require("./neededMsg").msgIds;
const treasureHelper = require("./treasureHelper");
const splittedMsgBuilder = require("./splittedMsgBuilder");
const JSONStream = require("JSONStream");
const indicesLoader = require("./indicesLoader");
const readline = require("readline");
const path = require("path");

let startHelper = () => {
  let stream = JSONStream.parse();
  indicesLoader.loadIndices();
  let snifferProcess = spawn(path.join(__dirname,"sniffer", "sniffer.exe"));

  snifferProcess.stdout.pipe(process.stdout);

  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("line", function(line) {
    if (isNaN(parseInt(line))) {
      console.log("Please enter a number : ");
      return;
    }
    snifferProcess.stdin.write(parseInt(line) + "\n");
    rl.removeAllListeners();
    snifferProcess.stdout.on("data", data => {
      if (data.includes("Listening")) {
        console.log("Redirecting sniffer stdout...");
        snifferProcess.stdout.unpipe(process.stdout);
        snifferProcess.stdout.pipe(stream);
        snifferProcess.removeAllListeners();
      }
    });
  });

  stream.on("data", async data => {
    let srcport = data["srcport"];
    let dataPayload = data["payload"];
    if (dataPayload) {
      // let dataPayload = payload[0].replace(/:/g, "");
      if (splittedMsgBuilder.isSplittedMsgWaiting()) {
        dataPayload = splittedMsgBuilder.tryAppendMsg(dataPayload);
        if (
          Buffer.byteLength(dataPayload, "hex") >=
          splittedMsgBuilder.getTotalLength()
        ) {
          splittedMsgBuilder.resetSplittedMsg();
        }
        if (splittedMsgBuilder.isSplittedMsgWaiting()) return;
      } else {
        handleSplitMsg(dataPayload);
        if (splittedMsgBuilder.isSplittedMsgWaiting()) return;
      }
      let msgId = payloadReader.readMsgId(dataPayload);
      if (!msgIds.includes(msgId)) return;
      let context = getContext(srcport);
      let decodedMessage = await decodePayload(dataPayload, context);
      if (msgId != 226) console.log(decodedMessage);
      treasureHelper.handleData(decodedMessage);
    }
    let msgId = payloadReader.readMsgId(dataPayload);
    if (!msgIds.includes(msgId)) return;
    let context = getContext(srcport);
    let decodedMessage = await decodePayload(dataPayload, context);
    // if (msgId != 226) console.log(decodedMessage);
    treasureHelper.handleData(decodedMessage);
  }
});

const MSGID_DATALEN_SIZE = 2;
function handleSplitMsg(dataPayload) {
  const dataLenLen = payloadReader.getDataLenLen(
    payloadReader.getHeaderFromPayload(dataPayload)
  );
  const HEADER_SIZE = MSGID_DATALEN_SIZE + dataLenLen;
  let dataLen = payloadReader.readDataLen(dataPayload);
  let dataPayloadLen = Buffer.byteLength(dataPayload, "hex") - HEADER_SIZE;
  if (!dataLen || dataLen == 0 || dataPayloadLen >= dataLen) return; //msg isn't split
  //msg is splitted
  splittedMsgBuilder.initSplittedMsg(dataPayload, dataLen + HEADER_SIZE);
}

async function decodePayload(payload, context) {
  let response;
  try {
    response = await axios.post(
      "http://vps408293.ovh.net:5000/decoder/".concat(context),
      payload
    );
  } catch (err) {
    console.log(`error ${payload}`);
  }
  if (response) {
    return response.data;
  }
  return "";
}

function getContext(srcport) {
  let context = "fromclient";
  if (srcport == 5555) {
    context = "fromserver";
  }
  return context;
}

module.exports = {
  startHelper: startHelper,
  testModule: () => console.log("module works")
}