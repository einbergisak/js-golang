class Mutex {
    constructor(){
        this.isLocked = false
    }

    lock() {
        this.isLocked = true
    }

    unlock() {
        this.isLocked = false
    }
}
export default Mutex