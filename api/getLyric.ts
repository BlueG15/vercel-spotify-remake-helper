import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MusixMatch } from './utils/musix_match_lyric';

function getPropertyNameFromReqObject(req : VercelRequest, propertyName : string, defaultValue? : any){
  let res : any = defaultValue
  if (req.body && req.body[propertyName]) {
      res = req.body[propertyName];
  } else if (req.query[propertyName]) {
      res = req.query[propertyName];
  } else if (req.cookies[propertyName]) {
      res = req.cookies[propertyName];
  }
  return res
}

//max 9 seconds
export default async function handler(req: VercelRequest, Vres: VercelResponse) {

   let mm = new MusixMatch();
  let isrc = getPropertyNameFromReqObject(req, "isrc");
  let type = getPropertyNameFromReqObject(req, "type")
  mm.main(isrc, type).then(res => {
    if(!res){
        Vres.status(400).send(new response(true, "fail to fetches song with this isrc", {isrc : isrc}));
    } else {
        if(res instanceof response){
            Vres.status(res.status).send(res);
        } else {
            Vres.status(200).send(new response(false, "successfully fetches lyric", res));
        }
    }
  }).catch(err => {
    Vres.status(400).send(new response(true, "fail to fetches song with this isrc", {isrc : isrc, fullError: util.format(err)}));
  })

}

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
