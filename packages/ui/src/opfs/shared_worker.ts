import { Channel, Service } from "../abc";
import { createSharedListener } from "../abc/shared";

export interface SharedApi {
    add42(n: number): Promise<number>
    open(path: string, mp: MessagePort):void
    memory(): Promise<WebAssembly.Memory|null>
}

class MvrServer implements Service {
    mem: WebAssembly.Memory|null

    constructor() {
        this.mem = new WebAssembly.Memory({initial: 1024, maximum: 1024, shared: true})
    }
    open(path: string, mp: MessagePort) {

    }
    // one per tab
    connect(ch: Channel) : SharedApi{
        const r : SharedApi = {
            open:  (path: string, mp: MessagePort) => {
                this.open(path, mp)
            },
            add42: async (n: number) => {
                return n + 42
            },
            memory: async() => {
                return this.mem
            }
        }
        return r
    }   
    disconnect(ch: Channel): void {
    }
}

async function createMvrServer() {
    return new MvrServer
}

if (!self.document) {
    // if we are a worker
    createMvrServer().then(e => createSharedListener(e))

}

