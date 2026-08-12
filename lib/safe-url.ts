import dns from "node:dns/promises";
import net from "node:net";

function privateIp(ip: string) {
  if (net.isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const normalized = ip.toLowerCase();
  return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

export async function assertSafePublicUrl(input: string) {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error("Please enter a valid web address."); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Only http and https recipe links are supported.");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) throw new Error("Local network addresses are not allowed.");

  if (net.isIP(hostname)) {
    if (privateIp(hostname)) throw new Error("Private network addresses are not allowed.");
  } else {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses.length || addresses.some(({ address }) => privateIp(address))) throw new Error("This address is not allowed.");
  }
  return url;
}
