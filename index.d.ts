declare module "matchit" {
  export function exec(
    url: string,
    match: Array<{ old: string; type: number; val: string }>
  ): { [index: string]: string };
  export function match(
    path: string,
    routes:
      | Array<{ old: string; type: number; val: string }>
      | Array<Array<{ old: string; type: number; val: string }>>
  ): Array<{ old: string; type: number; val: string }>;
  export function parse(path: string): Array<{ old: string; type: number; val: string }>;
}
