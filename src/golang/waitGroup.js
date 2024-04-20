class WaitGroup {
    constructor(){
        this.count = 0
    }

    decrement(){
        this.count--
    }

    increment(i){
        this.count += i
    }
}
export default WaitGroup