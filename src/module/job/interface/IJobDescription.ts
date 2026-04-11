export interface IJobDescription {
    jobExternalId: number;
    title: string;
    description: string;
    jobUrl: string;
    companyId: number;
    applyTypeId: number;
    contractTypeId: number;
    experienceLevelId: number;
    specialityId: number;
    sectorId: number;
    locationId: number;
    applyUrl: string;
    postedTime: string;
    salary?: string;
    applicationsCount?: string;
    benefits?: string;
    descriptionHtml?: string;
    posterProfileUrl?: string;
    posterFullName?: string;
    publishedAt: Date | string;
}
