/** A single matched record within a module's search results. */
export interface GlobalSearchRecord {
  id: string;
  label: string;
  subtitle?: string;
  route: string;
}

/** One module's search results — omitted entirely from the response if empty. */
export interface GlobalSearchGroup {
  module: string;
  records: GlobalSearchRecord[];
}
