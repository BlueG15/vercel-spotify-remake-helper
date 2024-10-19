class response<T extends Object>  {
    timeStamp: string
    fail : boolean
    note : string
    data : T
    overrideStatus : number
    constructor(fail : boolean, note : string, data? : T, status? : number){
        let time = new Date().toISOString()
        switch(fail) {
        case false : {
                console.log(note)
                this.fail = false
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                this.overrideStatus = status ? status : 400;
                break
            } 
        default : {
                this.fail = true
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                this.overrideStatus = status ? status : 200;
            }  
        }
    }
    fixAndAppendData(note: string){
        this.note += " " + note;
    }
}

export { response };
