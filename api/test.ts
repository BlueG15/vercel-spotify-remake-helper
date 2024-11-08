import type { VercelRequest, VercelResponse } from '@vercel/node'
//max 9 seconds
export default async function handler(req: VercelRequest, res: VercelResponse) {
  //const { name = 'World' } = req.query
  //await testTimer(res.query.time)
  let time = 1000;
 
  if (req.body && req.body.time) {
    time = Number(req.body.time);
  } else if (req.query.time) {
    time = Number(req.query.time);
  } else if (req.cookies.time) {
    time = Number(req.cookies.time);
  }
 
  await testTimer(time);
  res.status(200).send(`waited for ${time} seconds!`);
}


const testTimer = (time : number = 1000) => new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({});
    }, time)
})