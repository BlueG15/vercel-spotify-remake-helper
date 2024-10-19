class response<T extends Object>  {
    timeStamp: string
    status : number
    fail : boolean
    note : string
    data : T
    constructor(fail : boolean, note : string, data? : T, _status? : number){
        let time = new Date().toISOString()
        switch(fail) {
        case false : {
                console.log(note)
                this.fail = false
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                this.status = _status ? _status : 200;
                break
            } 
        default : {
                this.fail = true
                this.note = note
                this.timeStamp = time
                this.data = data ?? {} as T
                this.status = _status ? _status : 400;
            }  
        }
    }
    fixAndAppendData(note: string){
        this.note += " " + note;
    }
}

export { response };
