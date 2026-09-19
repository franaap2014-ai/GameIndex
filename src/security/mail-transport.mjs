import net from "node:net";
import tls from "node:tls";

function envConfig(){
  const host=String(process.env.GAMEINDEX_SMTP_HOST||"").trim();
  const port=Math.max(1,Math.min(65535,Number(process.env.GAMEINDEX_SMTP_PORT||587)||587));
  const secure=String(process.env.GAMEINDEX_SMTP_SECURE||"").toLowerCase()==="true"||port===465;
  const user=String(process.env.GAMEINDEX_SMTP_USER||"");
  const pass=String(process.env.GAMEINDEX_SMTP_PASS||"");
  const from=String(process.env.GAMEINDEX_SMTP_FROM||user||"");
  return {host,port,secure,user,pass,from,configured:Boolean(host&&from)};
}
export function mailTransportStatus(){const c=envConfig();return{configured:c.configured,host:c.configured?c.host:"",port:c.port,secure:c.secure,from:c.configured?c.from:""};}
function onceLine(socket){return new Promise((resolve,reject)=>{let buffer="";const onData=data=>{buffer+=data.toString("utf8");const lines=buffer.split(/\r?\n/).filter(Boolean);if(!lines.length)return;const last=lines.at(-1);if(/^\d{3} /.test(last)){cleanup();resolve(lines.join("\n"));}};const onErr=e=>{cleanup();reject(e)};const onEnd=()=>{cleanup();reject(new Error("SMTP_CONNECTION_CLOSED"))};function cleanup(){socket.off("data",onData);socket.off("error",onErr);socket.off("end",onEnd)}socket.on("data",onData);socket.on("error",onErr);socket.on("end",onEnd);});}
async function command(socket,text,expect=/^[23]/){socket.write(text+"\r\n");const response=await onceLine(socket);if(!expect.test(response))throw new Error(`SMTP_ERROR:${response.split("\n").at(-1)}`);return response;}
function connect(c){return new Promise((resolve,reject)=>{const socket=c.secure?tls.connect({host:c.host,port:c.port,servername:c.host,rejectUnauthorized:true},()=>resolve(socket)):net.connect({host:c.host,port:c.port},()=>resolve(socket));socket.setTimeout(15000,()=>socket.destroy(new Error("SMTP_TIMEOUT")));socket.once("error",reject);});}
async function upgradeStartTls(socket,c){await command(socket,"STARTTLS",/^220/);return await new Promise((resolve,reject)=>{const secure=tls.connect({socket,servername:c.host,rejectUnauthorized:true},()=>resolve(secure));secure.once("error",reject);});}
function sanitizeHeader(value){return String(value||"").replace(/[\r\n]+/g," ").trim();}
export async function sendMail({to,subject,text}={}){
  const c=envConfig();if(!c.configured)throw new Error("MAIL_NOT_CONFIGURED");let socket=await connect(c);
  try{
    await onceLine(socket);await command(socket,"EHLO gameindex.local");
    if(!c.secure&&Number(c.port)!==25){socket=await upgradeStartTls(socket,c);await command(socket,"EHLO gameindex.local");}
    if(c.user&&c.pass){await command(socket,"AUTH LOGIN",/^334/);await command(socket,Buffer.from(c.user).toString("base64"),/^334/);await command(socket,Buffer.from(c.pass).toString("base64"),/^235/);}
    await command(socket,`MAIL FROM:<${sanitizeHeader(c.from)}>`);await command(socket,`RCPT TO:<${sanitizeHeader(to)}>`);await command(socket,"DATA",/^354/);
    const body=[`From: GameIndex <${sanitizeHeader(c.from)}>`,`To: <${sanitizeHeader(to)}>`,`Subject: ${sanitizeHeader(subject)}`,"MIME-Version: 1.0","Content-Type: text/plain; charset=UTF-8","Content-Transfer-Encoding: 8bit","",String(text||"").replace(/\r?\n\./g,"\n.."),"."].join("\r\n");
    socket.write(body+"\r\n");const response=await onceLine(socket);if(!/^250/.test(response))throw new Error(`SMTP_ERROR:${response}`);await command(socket,"QUIT",/^221|^250/).catch(()=>{});return{sent:true};
  }finally{try{socket.end()}catch{}}
}
