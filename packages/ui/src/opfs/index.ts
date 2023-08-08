import { Peer, WorkerChannel, apiCall, apiListen } from '../abc'
import LocalState from './shared_worker?sharedworker'
export { type SharedApi } from './shared_worker'
import { SharedApi } from './shared_worker'

export interface TabStateApi {
    createDb(): Promise<any>
  }
  export function tabStateApi(peer: Peer): TabStateApi {
    return apiCall<TabStateApi>(peer, "createDb")
  }
  
// the shared worker is used to coordinate access to a shared webassembly memory
export async function makeShared() {
    const sw = new LocalState()
    sw.port.start()
    const peer = new Peer(new WorkerChannel(sw.port))
    const api = apiCall<SharedApi>(peer, "add42", "memory")
    api.add42(1).then( (e) => console.log("add42", e))
    const mem = await api.memory() //new WebAssembly.Memory({initial: 1024, maximum: 1024, shared: true})

    if (mem) {
      const memView = new Uint8Array(mem.buffer);

      // Write some bytes to the memory
      memView.set([1, 2, 3], 0);
      
      // Read the bytes back from the memory
      const bytes = memView.slice(0, 3);
      
      console.log(bytes); 
    }
    console.log("mem", mem)
    //api.memory().then( (e) => console.log("memory", e))
    // apiListen<TabStateApi>(this.api, {
    //   createDb: this.createDb.bind(this),
    // })
}