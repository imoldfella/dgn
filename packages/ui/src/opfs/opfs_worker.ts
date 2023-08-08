// import {  Peer, TransferableResult, WorkerChannel, apiListen } from "../abc"
// import { OpfsApi } from "./mvr_shared";

import { TransferableResult } from "../abc"


interface FileSystemSyncAccessHandle {
    getSize(): number
    read(buffer: ArrayBuffer, options: { at: number }): number
    write(buffer: ArrayBuffer, options: { at: number }): number
    truncate(size: number): void
    flush(): void
    close(): void
}
// should probably use shared array buffer, maybe atomics. like io uring or aeron
export class OpfsWorker {
    next = 32
    files = new Map<number, FileSystemSyncAccessHandle>()
    constructor(public root: FileSystemDirectoryHandle) {
    }

    static async create() {
        const root = await navigator.storage.getDirectory();
        const untitledFile = await root.getFileHandle("temp", { "create": true });
        return new OpfsWorker(root)
    }

    async getSize(fd: number): Promise<number> {
        const writable = this.files.get(fd)
        if (writable) {
            return writable.getSize()
        }
        return 0
    }
    async open(path: string): Promise<number> {
        console.log("open log", path)
        const untitledFile = await this.root.getFileHandle(path, { "create": true });
        const accessHandle: FileSystemSyncAccessHandle = await (untitledFile as any).createSyncAccessHandle();
        const fd = this.next++
        this.files.set(fd, accessHandle)
        return fd
    }
    async close(fd: number): Promise<void> {
        const writable = this.files.get(fd)
        if (writable) {
            await writable.close()
        }
    }
    async read(fd: number, at: number, readSize: number): Promise<TransferableResult> {
        const writable = this.files.get(fd)
        if (writable) {
            const readBuffer = new Uint8Array(readSize);
            const sz = writable.read(readBuffer, { "at": at });
            console.log("read",readSize, fd, at,  sz, readBuffer)
            const b = readBuffer.buffer.slice(0, sz)
            return new TransferableResult(b, [b])
        }
        return new TransferableResult(new Uint8Array(0), [])
    }
    async write(fd: number, at: number, data: Uint8Array): Promise<void> {
        const writable = this.files.get(fd)
        if (writable) {
            const writeSize = writable.write(data, { "at": at });
            console.log("write",writeSize, fd, at,  data)
        }
    }
}



console.log('opfs worker')
self.onmessage = async (e: any) => {
    console.log('%c opfs worker got port', 'color: green')
    const svc = await OpfsWorker.create()
    const mp: MessagePort = e.data
    mp.start()
    const p = new Peer(new WorkerChannel(mp))  // message port
    const r: OpfsApi = {
        open: svc.open.bind(svc),
        close: svc.close.bind(svc),
        read: svc.read.bind(svc),
        write: svc.write.bind(svc),
        getSize: svc.getSize.bind(svc)
    }
    apiListen<OpfsApi>(p, r)
}
