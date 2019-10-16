const notifier = require("node-notifier");

notifier.notify(
    {
      title: 'My awesome title',
      message: 'Hello from node, Mr. User!',
    //   icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
      sound: false, // Only Notification Center or Windows Toasters
      wait: true, // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait
    },
    function(err, response) {
      // Response is response from notification
    }
  );