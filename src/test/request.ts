import { app } from "../index";

export const request = async (path: string, opts?: RequestInit) => {
  const host = 'http://localhost'
  const res = await app.handle(
    new Request(`${host}${path[0] === '/' ? path : '/' + path}`, opts)
  );
  return await res.json();
}

