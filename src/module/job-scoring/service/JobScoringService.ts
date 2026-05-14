import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { IPaginated } from 'src/common/interface/IPaginated';
import { CandidateProfile } from 'src/module/candidate/entity/CandidateProfile';
import { CandidateProfileRepository } from 'src/module/candidate/repository/CandidateProfileRepository';
import { JobDescriptionRepository } from 'src/module/job/repository/JobDescriptionRepository';
import { OllamaJobScoringService } from 'src/module/ollama/service/OllamaJobScoringService';
import { AnthropicJobScoringService } from 'src/module/anthropic/service/AnthropicJobScoringService';
import { scoringConfig } from 'src/config/scoringConfig';
import { IJobScorerService } from '../interface/IJobScorerService';
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

const CANDIDATE_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class JobScoringService {
    private readonly logger = new Logger(JobScoringService.name);
    private readonly candidateCache = new Map<number, { profile: CandidateProfile; expiresAt: number }>();

    constructor(
        private readonly ollamaJobScoringService: OllamaJobScoringService,
        private readonly anthropicJobScoringService: AnthropicJobScoringService,
        private readonly jobDescriptionRepository: JobDescriptionRepository,
        private readonly candidateProfileRepository: CandidateProfileRepository,
        private readonly jobMatchScoreRepository: JobMatchScoreRepository,
        private readonly scorerModelRepository: ScorerModelRepository,
        @InjectQueue(JOB_SCORING_QUEUE) private readonly jobScoringQueue: Queue<IJobScoringQueuePayload>,
        private readonly jobScoringGateway: JobScoringGateway,
    ) {}

    private getActiveScorer(): { service: IJobScorerService; provider: ScorerProviderEnum } {
        if (scoringConfig.provider === ScorerProviderEnum.ANTHROPIC) {
            return { service: this.anthropicJobScoringService, provider: ScorerProviderEnum.ANTHROPIC };
        }
        return { service: this.ollamaJobScoringService, provider: ScorerProviderEnum.OLLAMA };
    }

    private getScorerByProvider(provider: ScorerProviderEnum): IJobScorerService {
        if (provider === ScorerProviderEnum.ANTHROPIC) {
            return this.anthropicJobScoringService;
        }
        return this.ollamaJobScoringService;
    }

    private async getCandidateProfile(candidateProfileId: number): Promise<CandidateProfile | null> {
        const now = Date.now();
        const cached = this.candidateCache.get(candidateProfileId);
        if (cached && cached.expiresAt > now) {
            return cached.profile;
        }
        const profile = await this.candidateProfileRepository.findById(candidateProfileId);
        if (profile) {
            this.candidateCache.set(candidateProfileId, { profile, expiresAt: now + CANDIDATE_CACHE_TTL_MS });
        }
        return profile;
    }

    async listForCandidate(candidateId: number, dto: ListScoresRequestDto): Promise<IPaginated<JobMatchScore>> {
        return this.jobMatchScoreRepository.listForCandidate(candidateId, dto);
    }

    async scoreNewestJobs(candidateId: number, requestParams: ScoreNewestJobsRequestDto = {}): Promise<IScoreAllJobsResponse> {
        const candidateProfile: CandidateProfile | null = await this.candidateProfileRepository.findById(candidateId);
        if (!candidateProfile) {
            throw new Error(`Candidate profile ${candidateId} not found.`);
        }

        const scorer = this.getActiveScorer();
        const scorerModel: ScorerModel = await this.scorerModelRepository.findOrCreate({
            scorerType: ScorerTypeEnum.LLM,
            scorerProvider: scorer.provider,
            scorerModel: scorer.service.modelName,
        });

        const jobs = await this.jobDescriptionRepository.findUnscoredByCandidateAndScorer(
            candidateProfile.candidateProfileId,
            scorerModel.scorerModelId,
            scorerModel.scorerModel,
            {
                titleKeyword: requestParams.titleKeyword,
                limit: requestParams.limit,
                publishedFrom: requestParams.publishedFrom,
                publishedTo: requestParams.publishedTo,
            },
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
            scorerModelId: scorerModel.scorerModelId,
            runId,
        }));

        await this.jobScoringQueue.addBulk(payload.map((data) => ({ name: JOB_SCORING_JOB_NAME, data })));

        this.logger.log(`Dispatched ${payload.length} scoring events (runId=${runId})`);
        return { dispatched: payload.length, runId };
    }

    async processScoreJobEvent(payload: IJobScoringQueuePayload): Promise<number> {
        const { jobDescriptionId, candidateProfileId, scorerModelId } = payload;

        const scorerModel = await this.scorerModelRepository.findById(scorerModelId);
        if (!scorerModel) {
            throw new Error(`Scorer model ${scorerModelId} not found`);
        }

        const provider = scorerModel.scorerProvider as ScorerProviderEnum;
        const scorerService = this.getScorerByProvider(provider);

        const [job, candidateProfile] = await Promise.all([
            this.jobDescriptionRepository.findById(jobDescriptionId),
            this.getCandidateProfile(candidateProfileId),
        ]);

        if (!job) {
            throw new Error(`Job description ${jobDescriptionId} not found`);
        }
        if (!candidateProfile) {
            throw new Error(`Candidate profile ${candidateProfileId} not found`);
        }

        const remaining = await this.jobScoringQueue.getWaitingCount();
        this.logger.log(`Scoring job: "${job.title}" (id: ${job.jobDescriptionId}, remaining=${remaining}, provider=${provider})`);

        const result: { score: number; reasons: object } = await scorerService.scoreJob({
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

    async toggleVisibility(id: number, hidden: boolean): Promise<JobMatchScore> {
        const updated = await this.jobMatchScoreRepository.toggleVisibility(id, hidden);
        if (!updated) {
            throw new NotFoundException(`Job match score ${id} not found`);
        }
        return updated;
    }

    async clearQueue(): Promise<{ cleared: boolean }> {
        await this.jobScoringQueue.obliterate({ force: true });
        this.logger.log('Cleared all jobs from job-scoring queue');
        return { cleared: true };
    }
}
