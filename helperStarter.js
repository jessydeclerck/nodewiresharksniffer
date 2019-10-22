const helper = require("./main");

let helperEventHandler = helper.helperEmitter;

helperEventHandler.on("helperStarted", data => {
  console.log("Helper started event detected");
  console.log(data);
});

helperEventHandler.on("newInterface", msg => {
    console.log("new interface detected");
    console.log(msg);
})
helperEventHandler.on("newStdinRequest", msg => {
    console.log("new stdin request :");
    console.log(msg.msg);
    helper.selectInterface(4);
})
helper.startHelper();

// test.stdout.on("error", error=>{
//     console.log("error recevied");
// })
// console.log(test);
