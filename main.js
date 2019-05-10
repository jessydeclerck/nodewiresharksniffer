const { spawn } = require("child_process");
const oboe = require("oboe");
const _ = require("lodash");
const tsharkParams = [
  "-T",
  "json",
  //   "-e",
  //   "ip.src",
  //   "-e",
  //   "ip.dst",
  //   "-e",
  //   "ip.id",
  //   "-e",
  //   "ip.flags",
  //   "-e",
  //   "ip.flags.rb",
  //   "-e",
  //   "ip.flags.df",
  //   "-e",
  //   "ip.flags.mf",
  //   "-e",
  //   "ip.frag_offset",
  //   "-e",
  //   "tcp.srcport",
  //   "-e",
  //   "tcp.dstport",
  //   "-e",
  //   "tcp.len",
  //   "-e",
  //   "tcp.seq",
  //   "-e",
  //   "tcp.nxtseq",
  "-e",
  "tcp.payload",
  //   "-e",
  //   "tcp.segment",
  "-o",
  "tcp.desegment_tcp_streams:false",
  "host",
  "54.154.81.32",
];
const tsharkProcess = spawn("tshark", tsharkParams);

oboe(tsharkProcess.stdout).node("layers", data => {
  // if (!_.isEmpty(data)) {
    console.log(data);
  // }
});

tsharkProcess.stderr.pipe(process.stdout);

tsharkProcess.on("close", code => {
  console.log(`child process exited with code ${code}`);
});
