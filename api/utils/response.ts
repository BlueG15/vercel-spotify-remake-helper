class response<T extends Object>  {
    timeStamp: string
    fail : boolean
    note : string
    data : T
    constructor(fail : boolean, note : string, data? : T){
        var time = new Date().toISOString()
        switch(fail) {
        case false : {
                console.log(note)
                this.fail = false
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                break
            } 
        default : {
                this.fail = true
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
            }  
        }
    }
    fixAndAppendData(note: string){
        this.note += " " + note;
    }
}

export { response };
