import { Injectable, Inject } from '@nestjs/common';
import { ActorRun, ApifyClient } from 'apify-client';
import type { DatasetClientListItemOptions } from 'apify-client';
import { ApifyActorsEnum } from '../enum';
import { IGetLinkedinJobsParams } from '../interface/IGetLinkedinJobsParams';
import { IJobDescriptionResponse } from '../interface/IJobDescriptionResponse';

@Injectable()
export class ApifyLinkedinJobsService {
    constructor(@Inject('APIFY_CLIENT') private readonly apifyClient: ApifyClient) {}

    async fetchJobs(params: IGetLinkedinJobsParams): Promise<IJobDescriptionResponse[]> {
        const run = await this.runActor(ApifyActorsEnum.LINKEDIN_JOBS_SCRAPER, params);
        return this.getDatasetItems(run.defaultDatasetId);
    }

    private async runActor(actorId: string, input: any): Promise<ActorRun> {
        try {
            return await this.apifyClient.actor(actorId).call(input);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    private async getDatasetItems(datasetId: string): Promise<IJobDescriptionResponse[]> {
        try {
            const listParams: DatasetClientListItemOptions = {
                limit: 1000,
            };
            const { items } = await this.apifyClient.dataset<IJobDescriptionResponse>(datasetId).listItems(listParams);
            console.log('getDatasetItems items', items);
            return items;
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: any): never {
        console.error(error);
        throw error;
    }
}
