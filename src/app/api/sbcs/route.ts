import { getSbcs } from "@/lib/data/sbcs";

export async function GET() {
  return Response.json({ sbcs: getSbcs() });
}
