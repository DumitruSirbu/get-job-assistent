import { ICompany } from 'src/module/company/interface/ICompany';
import { ISector, ILocation, ISpeciality, IContractType, IExperienceLevel, IApplyType } from './index';

export type JobPropertiesType = ICompany | ISector | ILocation | ISpeciality | IContractType | IExperienceLevel | IApplyType;
