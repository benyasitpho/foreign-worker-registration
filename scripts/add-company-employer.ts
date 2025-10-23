import { createEmployer, createWorker } from '../server/db.js';
import { storagePut } from '../server/storage.js';
import fs from 'fs';
import path from 'path';

async function uploadFile(filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
  const result = await storagePut(fileName, fileBuffer, contentType);
  return result.url;
}

async function main() {
  console.log('Starting company registration...');

  // Upload documents
  console.log('Uploading documents...');
  const companyDocUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/20.09.67หนังสือรับรองบริษัทชนม์ณกานต์.pdf');
  const photoUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8683584.jpg');
  const alienIdUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8683586.jpg');

  console.log('Documents uploaded successfully');

  // Register employer (Company)
  console.log('Registering company employer...');
  const employer = await createEmployer({
    employerType: 'company',
    companyName: 'บริษัท ชนม์ณกานต์ จำกัด',
    taxId: '0105567090198', // From company registration
    registrationNumber: '0105567090198',
    contactPerson: null,
    contactPosition: null,
    phone: '0000000000',
    email: null,
    fax: null,
    address: null,
    subdistrict: null,
    district: null,
    province: null,
    postalCode: null,
    businessType: null,
    numberOfEmployees: 1,
    capitalAmount: null,
    notes: 'จดทะเบียนเมื่อ 20 กันยายน 2567',
    documentsUrl: JSON.stringify([
      { type: 'companyRegistration', url: companyDocUrl }
    ]),
    createdBy: null,
  });

  console.log('Company employer registered:', employer);

  // Register employee (worker) - LEM SARATT
  console.log('Registering employee...');
  const employee = await createWorker({
    employerId: employer.id,
    title: 'Mr.',
    fullName: 'LEM SARATT',
    alienId: '1909894318', // From alien ID card
    nationality: 'กัมพูชา',
    dateOfBirth: new Date('2006-09-07'),
    gender: 'male',
    passportNo: 'IDKHM1909894318', // Using alien ID as passport equivalent
    passportIssueDate: null,
    passportExpiryDate: null,
    visaType: null,
    visaNo: null,
    visaExpiryDate: null,
    workPermitNo: null,
    workPermitExpiryDate: null,
    addressTh: 'บริษัท ชนม์ณกานต์ จำกัด ภัทรารมย์',
    subdistrictTh: null,
    districtTh: null,
    provinceTh: null,
    postalCodeTh: null,
    phone: null,
    email: null,
    emergencyContact: null,
    emergencyPhone: null,
    employerName: employer.companyName,
    position: 'WORKER',
    salary: null,
    workStartDate: null,
    workLocation: null,
    jobDescription: null,
    educationLevel: null,
    educationDetails: null,
    bloodType: null,
    allergies: null,
    medicalConditions: null,
    notes: 'อาชีพคุ้นตัดสวย',
    employmentStatus: 'active',
    resignationDate: null,
    profilePhotoUrl: photoUrl,
    documentsUrl: JSON.stringify([
      { type: 'alienId', url: alienIdUrl },
      { type: 'photo', url: photoUrl }
    ]),
    createdBy: null,
  });

  console.log('Employee registered:', employee);
  console.log('\n✅ Company registration completed successfully!');
  console.log(`Employer ID: ${employer.id}`);
  console.log(`Employee ID: ${employee.id}`);
}

main().catch(console.error);

