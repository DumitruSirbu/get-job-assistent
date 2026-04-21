import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { IPaginated } from 'src/common/interface/IPaginated';
import { CandidateProfile } from 'src/module/candidate/entity/CandidateProfile';
import { CandidateProfileRepository } from 'src/module/candidate/repository/CandidateProfileRepository';
import { JobDescription } from 'src/module/job/entity/JobDescription';
import { JobDescriptionRepository } from 'src/module/job/repository/JobDescriptionRepository';
import { OllamaJobScoringService } from 'src/module/ollama/service/OllamaJobScoringService';
import { ListScoresRequestDto } from '../dto/ListScoresRequestDto';
import { ScoreNewestJobsRequestDto } from '../dto/ScoreNewestJobsRequestDto';
import { JobMatchScore } from '../entity/JobMatchScore';
import { ScorerModel } from '../entity/ScorerModel';
import { ScorerProviderEnum, ScorerTypeEnum } from '../enum';
import { IJobScoringQueuePayload } from '../interface/IJobScoringQueuePayload';
import { IScoreAllJobsResponse } from '../interface/IScoreAllJobsResponse';
import { JobMatchScoreRepository } from '../repository/JobMatchScoreRepository';
import { ScorerModelRepository } from '../repository/ScorerModelRepository';
import { JOB_SCORING_QUEUE, JOB_SCORING_JOB_NAME } from '../const';
import { JobScoringGateway } from '../gateway/JobScoringGateway';

@Injectable()
export class JobScoringService {
    private readonly logger = new Logger(JobScoringService.name);

    constructor(
        private readonly ollamaJobScoringService: OllamaJobScoringService,
        private readonly jobDescriptionRepository: JobDescriptionRepository,
        private readonly candidateProfileRepository: CandidateProfileRepository,
        private readonly jobMatchScoreRepository: JobMatchScoreRepository,
        private readonly scorerModelRepository: ScorerModelRepository,
        @InjectQueue(JOB_SCORING_QUEUE) private readonly jobScoringQueue: Queue<IJobScoringQueuePayload>,
        private readonly jobScoringGateway: JobScoringGateway,
    ) {}

    async listForCandidate(candidateId: number, dto: ListScoresRequestDto): Promise<IPaginated<JobMatchScore>> {
        return this.jobMatchScoreRepository.listForCandidate(candidateId, dto);
    }

    async scoreNewestJobs(candidateId: number, dto: ScoreNewestJobsRequestDto = {}): Promise<IScoreAllJobsResponse> {
        const candidateProfile: CandidateProfile | null = await this.candidateProfileRepository.findById(candidateId);
        if (!candidateProfile) {
            throw new Error(`Candidate profile ${candidateId} not found.`);
        }

        const scorerModel: ScorerModel = await this.scorerModelRepository.findOrCreate({
            scorerType: ScorerTypeEnum.LLM,
            scorerProvider: ScorerProviderEnum.OLLAMA,
            scorerModel: this.ollamaJobScoringService.modelName,
        });

        const jobs: JobDescription[] = await this.jobDescriptionRepository.findUnscoredByCandidateAndScorer(
            candidateProfile.candidateProfileId,
            scorerModel.scorerModelId,
            scorerModel.scorerModel,
            { titleKeyword: dto.titleKeyword, limit: dto.limit },
        );

        if (!jobs.length) {
            this.logger.warn('No pending job descriptions found to score');
            return { dispatched: 0, runId: '' };
        }

        this.logger.log(`Dispatching ${jobs.length} scoring events for candidate "${candidateProfile.fullName}" using ${scorerModel.scorerModel}`);

        const runId = randomUUID();

        await this.jobScoringGateway.emitStarted({ runId, totalJobs: jobs.length });

        const payload: IJobScoringQueuePayload[] = jobs.map((job) => ({
            jobDescriptionId: job.jobDescriptionId,
            candidateProfileId: candidateProfile.candidateProfileId,
            runId,
        }));

        await this.jobScoringQueue.addBulk(payload.map((data) => ({ name: JOB_SCORING_JOB_NAME, data })));

        this.logger.log(`Dispatched ${payload.length} scoring events (runId=${runId})`);
        return { dispatched: payload.length, runId };
    }

    async processScoreJobEvent(payload: IJobScoringQueuePayload): Promise<number> {
        const { jobDescriptionId, candidateProfileId } = payload;

        const [job, candidateProfile] = await Promise.all([
            this.jobDescriptionRepository.findById(jobDescriptionId),
            this.candidateProfileRepository.findById(candidateProfileId),
        ]);

        if (!job) {
            throw new Error(`Job description ${jobDescriptionId} not found`);
        }
        if (!candidateProfile) {
            throw new Error(`Candidate profile ${candidateProfileId} not found`);
        }

        const scorerModel: ScorerModel = await this.scorerModelRepository.findOrCreate({
            scorerType: ScorerTypeEnum.LLM,
            scorerProvider: ScorerProviderEnum.OLLAMA,
            scorerModel: this.ollamaJobScoringService.modelName,
        });

        const remaining = await this.jobScoringQueue.getWaitingCount();
        this.logger.log(`Scoring job: "${job.title}" (id: ${job.jobDescriptionId}, remaining=${remaining})`);

        const result: { score: number; reasons: object } = await this.ollamaJobScoringService.scoreJob({
            jobTitle: job.title,
            jobDescription: job.description,
            candidateHeadline: candidateProfile.headline ?? '',
            candidateSkills: candidateProfile.skillsJson ?? {},
            candidateLanguages: candidateProfile.languagesJson ?? [],
            candidateYearsExperience: candidateProfile.yearsExperience ?? 0,
            candidateExperienceLevel: candidateProfile.experienceLevel?.experienceLevelName ?? '',
            candidateOpenToRemote: candidateProfile.openToRemote,
            candidateLocation: candidateProfile.location?.countryName ?? '',
        });

        try {
            await this.jobMatchScoreRepository.create({
                jobDescriptionId: job.jobDescriptionId,
                candidateProfileId: candidateProfile.candidateProfileId,
                scorerModelId: scorerModel.scorerModelId,
                version: scorerModel.scorerModel,
                score: result.score,
                reasonsJson: result.reasons,
                metadataJson: { model: scorerModel.scorerModel, jobTitle: job.title },
            } as JobMatchScore);
        } catch (error: unknown) {
            const isDuplicate = error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('unique constraint'));

            if (isDuplicate) {
                this.logger.warn(`Score already exists for job ${jobDescriptionId} / candidate ${candidateProfileId}, skipping`);
                return result.score;
            }

            throw error;
        }

        return result.score;
    }

    async clearQueue(): Promise<{ cleared: boolean }> {
        await this.jobScoringQueue.obliterate({ force: true });
        this.logger.log('Cleared all jobs from job-scoring queue');
        return { cleared: true };
    }
}
