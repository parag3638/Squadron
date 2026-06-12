/** Dataset metadata: league / nation / club lists for filters and the AI tools. */
import metaData from "@/data/meta.json";

export interface NameCount {
  name: string;
  count: number;
}

interface Meta {
  generatedFrom: string;
  count: number;
  leagues: NameCount[];
  nations: NameCount[];
  clubs: NameCount[];
}

const META = metaData as Meta;

export const leagues = META.leagues;
export const nations = META.nations;
export const clubs = META.clubs;
export const datasetInfo = { source: META.generatedFrom, count: META.count };

/** Case-insensitive resolution of a fuzzy league/nation name to its canonical form. */
function resolve(list: NameCount[], input: string): string | undefined {
  const q = input.trim().toLowerCase();
  const exact = list.find((x) => x.name.toLowerCase() === q);
  if (exact) return exact.name;
  const partial = list.find((x) => x.name.toLowerCase().includes(q));
  return partial?.name;
}

export const resolveLeague = (input: string) => resolve(leagues, input);
export const resolveNation = (input: string) => resolve(nations, input);
