import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BeforeUpdate, BeforeInsert } from 'typeorm';
import { Company } from 'src/module/company/entity/Company';
import { ApplyType } from './ApplyType';
import { ContractType } from './ContractType';
import { ExperienceLevel } from './ExperienceLevel';
import { Speciality } from './Speciality';
import { Sector } from './Sector';
import { Location } from './Location';

/**
 * {
    "id": "4283761912",
    "publishedAt": "2026-04-04",
    "salary": "",
    "title": "Senior Full Stack Software Engineer",
    "jobUrl": "https://uk.linkedin.com/jobs/view/senior-full-stack-software-engineer-at-reversinglabs-4283761912?trk=public_jobs_topcard-title",
    "companyName": "ReversingLabs",
    "companyUrl": "https://www.linkedin.com/company/reversinglabs?trk=public_jobs_topcard-org-name",
    "location": "United Kingdom",
    "postedTime": "1 day ago",
    "applicationsCount": "107 applicants",
    "description": "At ReversingLabs, our software supply chain security and threat intelligence solutions have become essential to advancing cybersecurity maturity around the globe. We're on a journey to expand adoption and accelerate growth by hiring top talent across the security industry.\n\nNotable breaches such as SolarWinds, CircleCI, and 3CX have elevated software supply chain security as a top initiative across every organization developing or purchasing software. Only ReversingLabs delivers the software package analysis speed and intelligence needed to protect against this critical area of risk.\n\nOur vision is clear. Arming every company with end-to-end insights to ensure development releases securely, IT purchases safely, and the SOC can effectively detect, isolate, and respond.\n\nYour future role as a Senior Software Engineer is extremely important for the success of our solution - a Spectra Assure platform for software assurance. This is a game-changing opportunity.\n\nOur company is at the forefront of innovation, with many aspects built from scratch, fostering an engineering-driven approach. We prioritize developer experience and the development of high-quality, well-documented, and tested code within our Research organization.\n\nYou and your teammates will work on developing a scalable and resilient SaaS platform. You will also be able to directly influence the architecture decisions and will be responsible for developing large parts of the new product. We are looking for people who can work independently, but also be a part of a team, and who adhere to the best practice engineering principles for clean and maintainable code. Crucially, if you identify more with being a skilled developer familiar with frontend technologies than strictly a frontend developer, you'll be a great fit for our team.\n\nResponsibilities\n\n\n * Develop a scalable and resilient SaaS platform, ensuring seamless integration between frontend and backend components for optimal performance and stability\n * Influence architecture decisions by offering strategic insights and recommendations based on expertise and best practices\n * Write, maintain, and optimize efficient, reusable, and reliable TypeScript and Python code\n * Stay up to date with industry best practices, emerging technologies, and modern design patterns\n * Translate UX designs into high-quality, user-friendly interfaces\n * Diagnose, troubleshoot, document, and resolve technical issues to maintain system reliability\n * Oversee and execute enterprise application deployments in production environments\n * Engage proactively with the product, understand its features, and contribute to its continuous improvement\n * Take technical ownership of complex feature development, ensuring scalability and maintainability\n   \n   \n\nRequired Skills\n\n\n * 7+ years of experience in software development\n * Advanced knowledge of programming in Typescript (Advanced knowledge of HTML5, CSS3 and React framework)\n * Good knowledge of programming in Python or other OO languages\n * Experience with setting up and maintaining frontend and backend tooling (build and test)\n * Experience in writing and maintaining a large codebase, making decisions that benefit long-term maintainability of such codebase\n * Fluent English communication skills (written and spoken) are essential for this role\n * Ability to work independently and as part of a team\n * Experience with implementing complex workflows\n * Experience with Docker and related technologies\n   \n   \n\nA BIG PLUS\n\n\n * Experience with Redux Toolkit, Material-UI, Webpack, and Storybook\n * Experience with Django, PostgreSQL\n * Experience with writing secure code\n   \n   \n\nWhat We Offer\n\nBenefits & Perks{{{{:}}}} Designed for How You Work, Live, and Grow\n\nAt ReversingLabs, we believe great work starts with feeling supported. We meet all statutory employment requirements in the United Kingdom and go beyond them. Ensuring you feel valued, secure, and set up to thrive both professionally and personally.\n\nStatutory Benefits (United Kingdom)\n\n\n * Paid annual leave, including public holidays\n * Statutory sick pay and parental leave\n * Workplace pension contributions\n * A safe, inclusive, and supportive work environment\n   \n   \n\nAnd because we believe in supporting the whole employee experience, Beyond statutory benefits. We offer a thoughtfully designed total rewards package and additional perks that supports your well-being, growth, and long-term success.\n\nCompensation & Financial Security\n\n\n * A competitive compensation package, including base salary and performance-based bonus or commission (role-dependent), as well as equity, so you share in the success you help build\n   \n   \n\nWork-Life Balance & Flexibility\n\n\n * Quarterly Wellness Weekends{{{{:}}}} company-wide 3-day breaks built into the year to truly rest and reboot\n * Monthly phone allowance to help offset mobile expenses\n * Medical allowance to support your healthcare needs\n * Volunteer Time Allowance{{{{:}}}} 8 paid hours annually to support a charitable organisation you care about\n * Complimentary Calm app membership to support mindfulness, focus, and stress management\n   \n   \n\nGrowth, Learning & Culture\n\n\n * Continuous learning and development with full access to Udemy Business\n * Clear paths for advancement, internal mobility, and ongoing career development\n * A collaborative, innovative, and remote-first environment where your work has real impact\n   \n   \n\nWorkplace Recognition\n\nReversingLabs is proud to be recognized as a Best Workplace by Inc. (2025) and a Best Place to Work by Built In (2025 & 2026) across multiple categories. Reflecting our commitment to building a workplace where people feel valued, supported, and empowered to grow.\n\nReversingLabs was founded in 2009 with the mission to offer the ultimate threat detection solutions. Our security products are used by some of the largest organizations in the world, including 2 of the top 3 banks, 4 of the top 6 software companies, and 2 of the top 6 insurance companies. We have been honored with numerous awards through the years including the 2023 Global InfoSec Award, 2022 CDM Global Infosec Awards, 2021 SC Media Trust Award for Best Threat Intelligence Technology, a 2020 Stevie Award, and the 2017 JPMorgan Chase Hall of Innovation Award for our truly unique malware and explainable threat intelligence products.\n\nOur pioneering technologies, exceptional products, and successful customer deployments also drove investments in ReversingLabs by some of the prominent investors in the world. With remote employees throughout the United States and England, and offices in Boston, United States and Zagreb, Croatia, ReversingLabs will continue to deliver groundbreaking innovation with top global talent.\n\nWe are committed to an inclusive and diverse team. ReversingLabs is an equal opportunity employer. We do not discriminate based on race, color, ethnicity, ancestry, national origin, religion, sex, gender, gender identity, gender expression, sexual orientation, age, disability, veteran status, genetic information, marital status or any legally protected status. If there is a match between your experiences/skills and the Company needs, we will contact you directly. ReversingLabs is an equal opportunity employer.\n\nApplicants only - Recruiting agencies, please do not contact.\n\n",
    "contractType": "Full-time",
    "experienceLevel": "Mid-Senior level",
    "workType": "Research",
    "sector": "Technology, Information and Internet",
    "applyType": "EASY_APPLY",
    "applyUrl": "https://uk.linkedin.com/jobs/view/senior-full-stack-software-engineer-at-reversinglabs-4283761912?trk=public_jobs_topcard-title",
    "descriptionHtml": "\n          At ReversingLabs, our software supply chain security and threat intelligence solutions have become essential to advancing cybersecurity maturity around the globe. We&apos;re on a journey to expand adoption and accelerate growth by hiring top talent across the security industry.<br><br>Notable breaches such as SolarWinds, CircleCI, and 3CX have elevated software supply chain security as a top initiative across every organization developing or purchasing software. Only ReversingLabs delivers the software package analysis speed and intelligence needed to protect against this critical area of risk.<br><br>Our vision is clear. Arming every company with end-to-end insights to ensure development releases securely, IT purchases safely, and the SOC can effectively detect, isolate, and respond.<br><br>Your future role as a Senior Software Engineer is extremely important for the success of our solution - a Spectra Assure platform for software assurance. This is a game-changing opportunity.<br><br>Our company is at the forefront of innovation, with many aspects built from scratch, fostering an engineering-driven approach. We prioritize developer experience and the development of high-quality, well-documented, and tested code within our Research organization.<br><br>You and your teammates will work on developing a scalable and resilient SaaS platform. You will also be able to directly influence the architecture decisions and will be responsible for developing large parts of the new product. We are looking for people who can work independently, but also be a part of a team, and who adhere to the best practice engineering principles for clean and maintainable code. Crucially, if you identify more with being a skilled developer familiar with frontend technologies than strictly a frontend developer, you&apos;ll be a great fit for our team.<br><br><strong>Responsibilities<br><br></strong><ul><li>Develop a scalable and resilient SaaS platform, ensuring seamless integration between frontend and backend components for optimal performance and stability</li><li>Influence architecture decisions by offering strategic insights and recommendations based on expertise and best practices</li><li>Write, maintain, and optimize efficient, reusable, and reliable TypeScript and Python code</li><li>Stay up to date with industry best practices, emerging technologies, and modern design patterns</li><li>Translate UX designs into high-quality, user-friendly interfaces</li><li>Diagnose, troubleshoot, document, and resolve technical issues to maintain system reliability</li><li>Oversee and execute enterprise application deployments in production environments</li><li>Engage proactively with the product, understand its features, and contribute to its continuous improvement</li><li>Take technical ownership of complex feature development, ensuring scalability and maintainability<br><br></li></ul><strong>Required Skills<br><br></strong><ul><li>7+ years of experience in software development</li><li>Advanced knowledge of programming in Typescript (Advanced knowledge of HTML5, CSS3 and React framework)</li><li>Good knowledge of programming in Python or other OO languages</li><li>Experience with setting up and maintaining frontend and backend tooling (build and test)</li><li>Experience in writing and maintaining a large codebase, making decisions that benefit long-term maintainability of such codebase </li><li>Fluent English communication skills (written and spoken) are essential for this role</li><li>Ability to work independently and as part of a team</li><li>Experience with implementing complex workflows</li><li>Experience with Docker and related technologies <br><br></li></ul><strong>A BIG PLUS<br><br></strong><ul><li>Experience with Redux Toolkit, Material-UI, Webpack, and Storybook</li><li>Experience with Django, PostgreSQL</li><li>Experience with writing secure code<br><br></li></ul><strong>What We Offer<br><br></strong><strong>Benefits &amp; Perks{{{{:}}}} Designed for How You Work, Live, and Grow<br><br></strong>At ReversingLabs, we believe great work starts with feeling supported. We meet all statutory employment requirements in the United Kingdom and go beyond them. Ensuring you feel valued, secure, and set up to thrive both professionally and personally.<br><br><strong>Statutory Benefits (United Kingdom)<br><br></strong><ul><li>Paid annual leave, including public holidays</li><li>Statutory sick pay and parental leave</li><li>Workplace pension contributions</li><li>A safe, inclusive, and supportive work environment<br><br></li></ul>And because we believe in supporting the whole employee experience, Beyond statutory benefits. We offer a thoughtfully designed total rewards package and additional perks that supports your well-being, growth, and long-term success.<br><br><strong>Compensation &amp; Financial Security<br><br></strong><ul><li>A competitive compensation package, including base salary and performance-based bonus or commission (role-dependent), as well as equity, so you share in the success you help build<br><br></li></ul><strong>Work-Life Balance &amp; Flexibility<br><br></strong><ul><li>Quarterly Wellness Weekends{{{{:}}}} company-wide 3-day breaks built into the year to truly rest and reboot</li><li>Monthly phone allowance to help offset mobile expenses</li><li>Medical allowance to support your healthcare needs</li><li>Volunteer Time Allowance{{{{:}}}} 8 paid hours annually to support a charitable organisation you care about</li><li>Complimentary Calm app membership to support mindfulness, focus, and stress management<br><br></li></ul><strong>Growth, Learning &amp; Culture<br><br></strong><ul><li>Continuous learning and development with full access to Udemy Business</li><li>Clear paths for advancement, internal mobility, and ongoing career development</li><li>A collaborative, innovative, and remote-first environment where your work has real impact<br><br></li></ul><strong>Workplace Recognition<br><br></strong>ReversingLabs is proud to be recognized as a Best Workplace by Inc. (2025) and a Best Place to Work by Built In (2025 &amp; 2026) across multiple categories. Reflecting our commitment to building a workplace where people feel valued, supported, and empowered to grow.<br><br>ReversingLabs was founded in 2009 with the mission to offer the ultimate threat detection solutions. Our security products are used by some of the largest organizations in the world, including 2 of the top 3 banks, 4 of the top 6 software companies, and 2 of the top 6 insurance companies. We have been honored with numerous awards through the years including the 2023 Global InfoSec Award, 2022 CDM Global Infosec Awards, 2021 SC Media Trust Award for Best Threat Intelligence Technology, a 2020 Stevie Award, and the 2017 JPMorgan Chase Hall of Innovation Award for our truly unique malware and explainable threat intelligence products.<br><br>Our pioneering technologies, exceptional products, and successful customer deployments also drove investments in ReversingLabs by some of the prominent investors in the world. With remote employees throughout the United States and England, and offices in Boston, United States and Zagreb, Croatia, ReversingLabs will continue to deliver groundbreaking innovation with top global talent.<br><br>We are committed to an inclusive and diverse team. ReversingLabs is an equal opportunity employer. We do not discriminate based on race, color, ethnicity, ancestry, national origin, religion, sex, gender, gender identity, gender expression, sexual orientation, age, disability, veteran status, genetic information, marital status or any legally protected status. If there is a match between your experiences/skills and the Company needs, we will contact you directly. ReversingLabs is an equal opportunity employer.<br><br><strong>Applicants only - Recruiting agencies, please do not contact.<br><br></strong>\n        ",
    "companyId": "974105",
    "benefits": "",
    "posterProfileUrl": "https://hr.linkedin.com/in/majavuceticivkovic",
    "posterFullName": "Maja Vučetić Ivković"
  },
 */
@Entity({ name: 'job_description', synchronize: false })
export class JobDescription {
    @PrimaryGeneratedColumn({ name: 'job_description_id' })
    jobDescriptionId: number;

    @Column({ name: 'job_external_id', type: 'bigint', unique: true })
    jobExternalId: number;

    @Column({ name: 'title', type: 'varchar' })
    title: string;

    @Column({ name: 'description', type: 'text' })
    description: string;

    @Column({ name: 'published_at', type: 'date' })
    publishedAt: Date | string;

    @Column({ name: 'job_url', type: 'varchar' })
    jobUrl: string;

    @Column({ name: 'company_id', type: 'integer' })
    companyId: number;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'companyId' })
    company: Company;

    @Column({ name: 'apply_type_id', type: 'integer' })
    applyTypeId: number;

    @ManyToOne(() => ApplyType)
    @JoinColumn({ name: 'apply_type_id', referencedColumnName: 'applyTypeId' })
    applyType: ApplyType;

    @Column({ name: 'contract_type_id', type: 'integer' })
    contractTypeId: number;

    @ManyToOne(() => ContractType)
    @JoinColumn({ name: 'contract_type_id', referencedColumnName: 'contractTypeId' })
    contractType: ContractType;

    @Column({ name: 'experience_level_id', type: 'integer' })
    experienceLevelId: number;

    @ManyToOne(() => ExperienceLevel)
    @JoinColumn({ name: 'experience_level_id', referencedColumnName: 'experienceLevelId' })
    experienceLevel: ExperienceLevel;

    @Column({ name: 'speciality_id', type: 'integer' })
    specialityId: number;

    @ManyToOne(() => Speciality)
    @JoinColumn({ name: 'speciality_id', referencedColumnName: 'specialityId' })
    speciality: Speciality;

    @Column({ name: 'sector_id', type: 'integer' })
    sectorId: number;

    @ManyToOne(() => Sector)
    @JoinColumn({ name: 'sector_id', referencedColumnName: 'sectorId' })
    sector: Sector;

    @Column({ name: 'location_id', type: 'integer', nullable: true })
    locationId?: number | null;

    @ManyToOne(() => Location)
    @JoinColumn({ name: 'location_id', referencedColumnName: 'locationId' })
    location: Location;

    @Column({ name: 'apply_url', type: 'varchar' })
    applyUrl: string;

    @Column({ name: 'salary', type: 'varchar', nullable: true })
    salary?: string | null;

    @Column({ name: 'applications_count', type: 'varchar', nullable: true })
    applicationsCount?: string | null;

    @Column({ name: 'posted_time', type: 'varchar', nullable: true })
    postedTime?: string | null;

    @Column({ name: 'benefits', type: 'text', nullable: true })
    benefits?: string | null;

    @Column({ name: 'description_html', type: 'text', nullable: true })
    descriptionHtml?: string | null;

    @Column({ name: 'poster_profile_url', type: 'varchar', nullable: true })
    posterProfileUrl?: string | null;

    @Column({ name: 'poster_full_name', type: 'varchar', nullable: true })
    posterFullName?: string | null;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}
