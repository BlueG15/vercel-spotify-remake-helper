import type { VercelRequest} from '@vercel/node'

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

export default getPropertyNameFromReqObject