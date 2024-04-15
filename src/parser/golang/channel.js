class Channel {
  constructor() {
    this.value = null
    this.senderQueue = []
    this.receiverQueue = []
    this.sendInProgress = false
  }

  send(routine, data) {
    console.log("SENDINGSENDING")

    if (!this.sendInProgress && this.receiverQueue.length > 0) {
      const receiver = this.receiverQueue.shift();
      receiver.canRun = true
      this.value = data
      console.log("SENDING VALUE ",this.value)
      this.sendInProgress = true
      return
    } else if (!this.senderQueue.includes(routine)){
      routine.canRun = false
      routine.PC -= 3
      this.senderQueue.push(routine)
    }
  }

  receive(routine) {
    console.log("RECEIVINGRECEIVING")

    if (this.sendInProgress && this.senderQueue.length > 0) {
      const sender = this.senderQueue.shift();
      this.sendInProgress = false
      const val = this.value
      console.log("RECEIVED VALUE ",val)
      this.value = null
      sender.canRun = true
      return val
    } else if (!this.receiverQueue.includes(routine)){
      routine.canRun = false
      routine.PC -= 2
      this.receiverQueue.push(routine)
    }
  }
}
export default Channel