import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import type { Socket } from 'socket.io';
import { JOB_SCRAPING_NAMESPACE, JobScrapingClientEvent, JobScrapingServerEvent } from '../../../../lib/sdk/ws/consts';
import { JobScrapingRunStatusEnum } from '../../../../lib/sdk/ws/enum';
import type { IJobScrapingStartedPayload, IJobScrapingSubscribePayload } from '../../../../lib/sdk/ws/interface';
import { Public } from 'src/module/auth/decorator/Public';
import type { IJobScrapingCounters } from '../interface/IJobScrapingCounters';
import { JobScrapingRunSnapshotService } from '../service/JobScrapingRunSnapshotService';

@Public()
@WebSocketGateway({
    namespace: JOB_SCRAPING_NAMESPACE,
    cors: {
        origin: [process.env.DASHBOARD_URL],
        credentials: true,
    },
})
export class JobScrapingGateway {
    private readonly logger = new Logger(JobScrapingGateway.name);

    @WebSocketServer()
    private readonly server: Server;

    constructor(private readonly snapshotService: JobScrapingRunSnapshotService) {}

    @SubscribeMessage(JobScrapingClientEvent.SUBSCRIBE)
    async handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() payload: IJobScrapingSubscribePayload): Promise<{ ok: boolean }> {
        if (!payload?.runId) {
            return { ok: false };
        }

        await client.join(this.roomFor(payload.runId));
        this.logger.log(`Client ${client.id} subscribed to run ${payload.runId}`);

        const snapshot = await this.snapshotService.getSnapshot(payload.runId);
        if (snapshot) {
            client.emit(JobScrapingServerEvent.SNAPSHOT, snapshot);
        }

        return { ok: true };
    }

    async emitStarted(payload: IJobScrapingStartedPayload): Promise<void> {
        await this.snapshotService.create(payload.runId, payload.totalLocations, payload.locations);
        this.server.to(this.roomFor(payload.runId)).emit(JobScrapingServerEvent.STARTED, payload);
    }

    async emitLocationCompleted(payload: { runId: string; location: string; foundJobs: number }): Promise<void> {
        const counters = await this.snapshotService.incrementCompleted(payload.runId, payload.foundJobs, payload.location);

        this.server.to(this.roomFor(payload.runId)).emit(JobScrapingServerEvent.LOCATION_COMPLETED, {
            runId: payload.runId,
            location: payload.location,
            foundJobs: payload.foundJobs,
            completedLocations: counters.completedLocations,
            totalLocations: counters.totalLocations,
        });

        await this.maybeFinish(payload.runId, counters);
    }

    async emitLocationFailed(payload: { runId: string; location: string; error: string }): Promise<void> {
        const counters = await this.snapshotService.incrementFailed(payload.runId, payload.location, payload.error);

        this.server.to(this.roomFor(payload.runId)).emit(JobScrapingServerEvent.LOCATION_FAILED, {
            runId: payload.runId,
            location: payload.location,
            error: payload.error,
            completedLocations: counters.completedLocations,
            totalLocations: counters.totalLocations,
        });

        await this.maybeFinish(payload.runId, counters);
    }

    private async maybeFinish(runId: string, counters: IJobScrapingCounters): Promise<void> {
        if (counters.completedLocations + counters.failedLocations < counters.totalLocations) {
            return;
        }

        const status =
            counters.failedLocations === 0
                ? JobScrapingRunStatusEnum.SUCCESS
                : counters.completedLocations === 0
                  ? JobScrapingRunStatusEnum.FAIL
                  : JobScrapingRunStatusEnum.PARTIAL;

        await this.snapshotService.markFinished(runId, status);

        this.server.to(this.roomFor(runId)).emit(JobScrapingServerEvent.FINISHED, {
            runId,
            status,
            totalFoundJobs: counters.totalFoundJobs,
            successfulLocations: counters.completedLocations,
            failedLocations: counters.failedLocations,
            totalLocations: counters.totalLocations,
        });

        void this.server.in(this.roomFor(runId)).socketsLeave(this.roomFor(runId));
    }

    private roomFor(runId: string): string {
        return `run:${runId}`;
    }
}
