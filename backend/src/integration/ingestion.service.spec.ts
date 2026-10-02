import { IngestionService } from './ingestion.service';

// The one non-trivial branch: a fetcher that throws must mark the source
// DEGRADED and NOT propagate the error out of runSource.
describe('IngestionService.runSource', () => {
  it('marks source DEGRADED instead of throwing when the fetcher fails', async () => {
    const source = { id: 's1', shortName: 'FAO', errorRate: 0, recordsCount: 10, config: { provider: 'fao' } };
    const updates: any[] = [];
    const prisma: any = {
      dataSource: {
        findUnique: async () => source,
        update: async (args: any) => { updates.push(args.data); return {}; },
      },
    };
    const failingFetcher: any = { run: async () => { throw new Error('FAOSTAT HTTP 521'); } };
    const unusedWorldBank: any = { run: async () => { throw new Error('should not be called on FAO source'); } };
    const svc = new IngestionService(prisma, failingFetcher, unusedWorldBank);

    const result = await svc.runSource('s1');

    expect(result).toEqual({ written: 0 });
    expect(updates[0].status).toBe('DEGRADED');
    expect(updates[0].errorRate).toBe(1);
  });
});
