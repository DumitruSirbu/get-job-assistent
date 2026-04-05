import { Injectable, Inject } from '@nestjs/common';
import { ApifyClient } from 'apify-client';
import { IGetLinkedinJobsParams } from '../interface/IGetLinkedinJobsParams';
import { ApifyActorsEnum } from '../enum';

@Injectable()
export class ApifyLinkedinJobsService {
    constructor(@Inject('APIFY_CLIENT') private readonly apifyClient: ApifyClient) {}

    async fetchJobs(params: IGetLinkedinJobsParams) {
        const run = await this.runActor(ApifyActorsEnum.LINKEDIN_JOBS_SCRAPER, params);
        return this.getDatasetItems(run.defaultDatasetId);
    }

    private async runActor(actorId: string, input: any) {
        const run = await this.apifyClient.actor(actorId).call(input);
        return run;
    }

    private async getDatasetItems(datasetId: string) {
        const { items } = await this.apifyClient.dataset(datasetId).listItems();
        return items;
    }
}
