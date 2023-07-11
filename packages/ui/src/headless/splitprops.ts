/* eslint-disable @typescript-eslint/ban-ts-comment */

export function splitProps(props: object, arg1: string[]): [any, any] {
    const internal: object = {};
    const external: object = {};
  
    for (const key in props) {
      if (arg1.includes(key)) {
        // @ts-ignore
        internal[key] = props[key] ;
      } else {
        // @ts-ignore
        external[key] = props[key] ;
      }
    }
  
    return [internal, external];
  }