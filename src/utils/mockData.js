/* Hardcoded test data. Per BRIEF.md, real Capital One / Sheets integration is not built yet. */

export const MOCK_USER = {
  name: 'David Crossley',
  email: 'david@acmeok.com',
};

export const MOCK_TRANSACTION = {
  transactionId: 'TXN-10293',
  merchant: 'Home Depot #4471',
  amount: 214.87,
  date: '2026-07-27T14:32:00',
  cardholderName: 'David Crossley',
};

/* Shape mirrors the real Task Log sheet: Task ID + Task Description, filtered
   to jobs assigned to the signed-in cardholder that aren't completed yet. */
export const MOCK_JOBS = [
  { id: '1067', description: 'Please scope the sewer line for the Indigo job this afternoon.' },
  { id: '1071', description: 'Obtain a voided check from Will Larson and add him to Gmail.' },
  { id: '1074', description: 'Install lights at the football stadium in Yukon.' },
];

export const MOCK_HISTORY = [
  {
    merchant: "Lowe's #2201",
    amount: 89.12,
    jobId: '1071',
    jobDescription: 'Obtain a voided check from Will Larson and add him to Gmail.',
    date: '2026-07-25',
  },
  {
    merchant: 'Sherwin-Williams',
    amount: 156.4,
    jobId: '1067',
    jobDescription: 'Please scope the sewer line for the Indigo job this afternoon.',
    date: '2026-07-24',
  },
  {
    merchant: 'Home Depot #4471',
    amount: 42.99,
    jobId: '1074',
    jobDescription: 'Install lights at the football stadium in Yukon.',
    date: '2026-07-22',
  },
];
