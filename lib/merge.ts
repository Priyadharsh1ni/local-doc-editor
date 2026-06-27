export function merge(server: string, local: string) {
  if (server === local) return server;
  return server.length > local.length ? server : local;
}