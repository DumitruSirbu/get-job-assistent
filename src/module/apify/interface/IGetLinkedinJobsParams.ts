import { IGetLinkedinJobsProxyParam } from './IGetLinkedinJobsProxyParam';

/**
 * "title": "",
  "location": "United States",
  "companyName": [
    "Google",
    "Microsoft"
  ],
  "companyId": [
    "76987811",
    "1815218"
  ],
  "publishedAt": "",
  "rows": 50,
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": [
      "RESIDENTIAL"
    ]
  }
 */
export interface IGetLinkedinJobsParams {
    title: string;
    location: string;
    companyName: string[];
    companyId: string[];
    publishedAt: string;
    rows: number;
    proxy: IGetLinkedinJobsProxyParam;
}
