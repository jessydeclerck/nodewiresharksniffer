const {spawn} = require("child_process");

spawn("./notifier/SnoreToast.exe", ["-m", "Hello", "-t", "World", "-s", "Notification.Default"]);