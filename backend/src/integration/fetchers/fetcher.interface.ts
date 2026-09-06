import { DataSource } from '@prisma/client';

// A fetcher pulls from one external provider, maps the payload into our schema,
// and writes rows to its own target table. Returns the number of rows written.
export interface Fetcher {
  run(source: DataSource): Promise<number>;
}
