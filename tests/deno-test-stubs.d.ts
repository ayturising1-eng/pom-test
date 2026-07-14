declare module 'npm:@supabase/supabase-js@2' {
  export function createClient(...args: any[]): any;
}
declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};
