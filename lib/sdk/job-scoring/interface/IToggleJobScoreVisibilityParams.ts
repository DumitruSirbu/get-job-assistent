import { IJobScoreRow } from './IJobScoreRow';

export interface IToggleJobScoreVisibilityParams {
    id: string;
    hidden: boolean;
}

export interface IToggleJobScoreVisibilityResponse extends IJobScoreRow {}
