import { ScorerProviderEnum, ScorerTypeEnum } from '../enum';

export interface IScorerModel {
    scorerType: ScorerTypeEnum;
    scorerProvider: ScorerProviderEnum;
    scorerModel: string;
}
