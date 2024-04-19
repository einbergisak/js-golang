class WaitGroup {
    constructor(){
        this.count = 0
        console.log("CREATING WAITGROUP")
    }

    decrement(){
        this.count--
    }

    increment(i){
        this.count += i
    }
}
export default WaitGroup