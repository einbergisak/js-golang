class Channel {
  constructor() {
    this.sendQueue = [];
    this.receiveQueue = [];
  }

  async send(data) {
    if (this.receiveQueue.length > 0) {
      const receiver = this.receiveQueue.shift();
      receiver.resolve(data);
    } else {
      await new Promise(resolve => { // await until resolved by receiver
        this.sendQueue.push(resolve);
      });
    }
  }

  async receive() {
    if (this.sendQueue.length > 0) {
      const resolveSender = this.sendQueue.shift();
      return resolveSender();
     } else {
      return await new Promise(resolve => { // await until resolved by sender
        this.receiveQueue.push(resolve);
      });
    }
  }
}
export default Channel