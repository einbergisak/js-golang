import { INSTRUCTION_ALLOWANCE } from "./goVm.js"
class Channel {
  constructor() {
    this.value = null
    this.senderQueue = []
    this.receiverQueue = []
    this.sendInProgress = false
  }

  // waitgroup och mutex till klass????

  send(routine, data) {
    //console.log("SENDINGSENDING")
    if (!this.senderQueue.includes(routine)){
      this.senderQueue.push(routine)
    }
    if (!this.sendInProgress && this.receiverQueue.length > 0) {
      const receiver = this.receiverQueue.shift();
      this.value = data
      // console.log("SENDING VALUE ",this.value)
      this.sendInProgress = true
      return
    }
    routine.instrCounter = INSTRUCTION_ALLOWANCE // Suspend routine
    routine.PC -= 3
  }

  receive(routine) {
    //console.log("RECEIVINGRECEIVING")

    if (!this.receiverQueue.includes(routine)){
      this.receiverQueue.push(routine)
    }
    if (this.sendInProgress && this.senderQueue.length > 0) {
      const sender = this.senderQueue.shift();
      this.sendInProgress = false
      const val = this.value
      //console.log("RECEIVED VALUE ",val)
      this.value = null
      return val
    }
    routine.instrCounter = INSTRUCTION_ALLOWANCE // Suspend routine
    routine.PC -= 2
  }
}
export default Channel