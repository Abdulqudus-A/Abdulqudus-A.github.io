import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

// Sources for this file:
// - How a session is created at sign-in and checked on every request: the auth
//   service and the shared guard, read on the author's machine.
// - Deliberately left out: key formats, role names, settings, messages and timings.

export const sessionDiagram: DiagramDef = {
  width: 680,
  height: 252,
  label:
    "Architecture: two devices sign in through one auth service, which writes the account's current session to a session cache. Requests from either device go to any service, and that service compares the session in the token with the one in the cache.",
  nodes: {
    devA: { x: 12, y: 16, w: 96, label: "Device A" },
    devB: { x: 12, y: 192, w: 96, label: "Device B" },
    auth: { x: 148, y: 104, w: 124, label: "Auth service" },
    cache: { x: 316, y: 104, w: 132, label: "Session cache" },
    svc: { x: 500, y: 104, w: 124, label: "Any service" },
  },
  edges: {
    signA: { d: "M 60 60 V 126 H 140", label: "sign in", lx: 68, ly: 92, anchor: "start" },
    signB: { d: "M 60 192 V 126 H 140", label: "sign in", lx: 68, ly: 168, anchor: "start" },
    write: { d: "M 272 126 H 308" },
    check: { d: "M 492 126 H 456", both: true },
    reqA: { d: "M 108 38 H 562 V 96", label: "requests", lx: 330, ly: 30 },
    reqB: { d: "M 108 214 H 562 V 156", label: "requests", lx: 330, ly: 232 },
  },
};

export const sessionSteps: WalkStep[] = [
  {
    title: "The account signs in on device A",
    body: "The auth service checks the credentials and creates a session ID. It puts the ID inside the signed token and writes it to the cache under the account. The token goes back to device A.",
    active: ["devA", "auth", "cache"],
    edges: ["signA", "write"],
  },
  {
    title: "Device A makes a request",
    body: "Every service runs the same guard. After checking the token’s signature it reads the account’s session from the cache and compares it with the one in the token. They match, so the request goes through and the session’s expiry is pushed forward.",
    active: ["devA", "svc", "cache"],
    edges: ["reqA", "check"],
  },
  {
    title: "The same account signs in on device B",
    body: "A new session ID is written over the old one. Nothing is sent to device A, and nothing needs to be.",
    active: ["devB", "auth", "cache"],
    edges: ["signB", "write"],
  },
  {
    title: "Device A makes its next request",
    body: "Its token is still unexpired and its signature still checks out. But the session inside it no longer matches the cache, so the guard refuses the request and tells the user they have signed in somewhere else.",
    active: ["svc", "cache"],
    failed: ["devA"],
    edges: ["reqA", "check"],
  },
  {
    title: "Device B goes quiet",
    body: "Each accepted request pushes the expiry forward. If device B stays idle long enough the entry lapses, and its next request is refused the same way. No entry means no session.",
    active: ["devB", "svc", "cache"],
    edges: ["reqB", "check"],
  },
];
