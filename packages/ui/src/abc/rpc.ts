import { decode } from "cbor-x"

export interface Channel {
    postMessage(data: any, transfer?: any[]): void
    listen(fn: (d: any) => void): void
    close(): void
}

export type RpcReply = {
    id: number
    result?: any
    error?: any
}
export type Rpc<T> = {
    method: string
    params: T
    id: number
}

export interface Service {
    connect(ch: Channel): object // return api set. not sure how to type this yet.
    disconnect(ch: Channel): void
}


export class Listener {
    _listen = new Set<() => void>()
    add(p: () => void) {
        this._listen.add(p)
    }
    remove(p: () => void) {
        this._listen.delete(p)
    }
    notify() {
        for (const p of this._listen) {
            p()
        }
    }
}

type Statusfn = (x: string) => void
type Recv = (x: any) => void
// maybe make a url that works with all of these?
export class WorkerChannel implements Channel {
    constructor(public port: MessagePort) {
        if (!(port instanceof MessagePort)) {
            throw new Error("not a message port")
        }
    }
    postMessage(data: any, transfer?: any[]): void {
        if (transfer) {
        this.port.postMessage(data,transfer)
        } else {
            this.port.postMessage(data)
        }
    }
    listen(fn: (d: any) => void): void {
        this.port.onmessage = fn
    }
    close() {
        this.port.close()
    }
}



export class WsChannel implements Channel {
    ws?: WebSocket
    recv?: (d: any) => void
    url: string
    constructor( url?: string) {
        // default to /wss
        this.url = url ?? `wss://${location.host}/wss`  //location.href
        this.connect()
    }
    status(x: string) {
        console.log("ws status", x)
    }
    connect() {
        this.ws = new WebSocket(this.url)
        this.status("connecting")
        this.ws.onclose = () => {
            this.status("closed")
        }
        this.ws.onerror = () => {
            this.status("error")
        }
        this.ws.onopen = () => this.status("")
        this.ws.onmessage = async (e: MessageEvent) => {
            if (typeof e.data === "string") {
                const txt = await e.data
                this.recv?.(JSON.parse(txt))
            } else {
                this.recv?.(decode(e.data))
            }
        }
    }
    listen(fn: (d: any) => void): void {
        this.recv = fn
    }
    postMessage(data: any): void {
        this.ws?.send(data)
    }
    close() {
        this.ws?.close()
    }
    get isConnected() {
        return this.ws?.readyState === WebSocket.OPEN
    }
}

export class Wrtc implements Channel {
    pc?: RTCDataChannel
    recv?: (d: any) => void 
    constructor() {
        const pc = new RTCPeerConnection()
        pc.ondatachannel = (e) => {
            this.pc = e.channel
            this.pc.onmessage = (e) => {
                this.recv?.(e.data)
            }
        }
        const dc = pc.createDataChannel("abc")
        this.pc = dc
    }
    listen(fn: (d: any) => void): void {
        this.recv = fn
    }
    postMessage(data: any): void {
        this.pc?.send(data)
    }
    close() {
        this.pc?.close()
    }
}

// imported into every worker? how do we register in every worker?
// import { is } from '../../../../dgdb/dghome/src/entry.preview';




// export interface Peer {
//     rpc: (message: Rpc<any>) => Promise<RpcReply>
//     notify: (message: Rpc<any>) => void
//     reply: (message: RpcReply) => void 
//     // this can have any number of replies, some result c
//     close(): void
// } 

export type ApiSet = {
    [key: string]: ((...a: any[]) => Promise<any>)
}

// used as a type for a result that can be transfered.
export class TransferableResult {
    constructor(public result: any, public transfer: any[]) {
    }
}

// a peer needs to support multiple api's, for listening try each in order.
export class Peer {
    nextId = 1
    reply_ = new Map<number, [(data: any) => void, (data: any) => void]>()
    api: ApiSet[] = []

    constructor(public ch: Channel) {
        ch.listen((d: any) => {
            this.recv(d.data)
        })
    }

    async rpc<T>(method: string, params: any[], transfer?: any[]): Promise<T> {
        const w = this.ch // as WorkerChannel
        console.log("send", method, params, transfer)
        const id = this.nextId++
        if (transfer && w instanceof WorkerChannel) {
            w.port.postMessage({ method, params, id: id }, transfer)
        } else {
            w.postMessage({ method, params, id: id })
        }
        
        return new Promise<T>((resolve, reject) => {
            this.reply_.set(id, [resolve, reject])
        })
    }

    async recv(data: any) {
        //console.log("recv", data)
        if (data.method) {
            console.log("listen ", data.method, data.params)
            for (const apix of this.api) {
                const api = apix[data.method]
                if (!api) {
                    continue
                }
                try {                   
                    const result = await api.apply(null,data.params)
                    if (result instanceof TransferableResult) {
                        //console.log("transfer", result.transfer)
                        this.ch?.postMessage({
                            id: data.id,
                            result: result.result
                        }, result.transfer)
                    } else {
                    this.ch?.postMessage({
                        id: data.id,
                        result: result
                    })
                }
                    //console.log("returned",data.id,result)
                    return
                } catch (e: any) {
                    console.log("%c error "+e, "color:red")
                    this.ch?.postMessage({
                        id: data.id,
                        error: e.toString()
                    })
                    return
                }
            }
        }
        else if (data.id) {
            const r = this.reply_.get(data.id)
            if (!r) {
                console.log("%c unknown reply " + data.id, "color:red")
            } else {
                this.reply_.delete(data.id)
                if (data.error) {
                    console.log("error", data.error)
                    r[1](data.error)
                } else {
                    // note that result can be void
                    //console.log("resolved", data.result)
                    r[0](data.result)
                }
                return
            }
            //}
        } else {
            console.log("unknown message", data)
        }
    }
}
// we create api's from channels
// build an rpc set from a list of rpc names
// eventually change this to code generation, or maybe typescript magic
export function apiCall<T>(peer: Peer, ...rpc: string[]): T {
    const o: any = {}
    rpc.forEach((method) => {
        o[method] = async (...arg: any[]): Promise<any> => {
            //console.log("rpc", method, arg)
            try {
                return await peer.rpc(method, arg)
            } catch (e) {
                console.log("rpc throw", method, e)
                return null
            }
        }
    })
    return o as T
}

// listen on a peer? maybe we should wrap call on a peer too.
export function apiListen<T>(peer: Peer, api: T): void {
    peer.api.push(api as ApiSet)
}
