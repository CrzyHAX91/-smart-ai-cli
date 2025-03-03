export default {
  name: 'hello-world',
  version: '1.0.0',
  description: 'A simple hello world plugin to demonstrate plugin functionality',

  initialize() {
    // Plugin initialization code
    console.log('Hello World plugin initialized');
  },

  execute(args) {
    return {
      message: `Hello from plugin! Arguments received: ${JSON.stringify(args)}`,
      timestamp: new Date().toISOString()
    };
  }
};
