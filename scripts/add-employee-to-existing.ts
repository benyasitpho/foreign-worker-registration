import { createWorker } from '../server/db.js';
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
  console.log('Adding employee to existing company...');

  // Upload documents
  console.log('Uploading documents...');
  const photoUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8683584.jpg');
  const alienIdUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8683586.jpg');

  console.log('Documents uploaded successfully');

  // Register employee to existing company (ID: 10001 - บริษัท ชนม์ณกานต์ จำกัด)
  console.log('Registering employee to company ID: 10001...');
  const employee = await createWorker({
    employerId: 10001, // Existing company
    title: 'Mr.',
    fullName: 'LEM SARATT',
    alienId: '1909894318',
    nationality: 'กัมพูชา',
    dateOfBirth: new Date('2006-09-07'),
    gender: 'male',
    passportNo: 'IDKHM1909894318',
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
    employerName: 'บริษัท ชนม์ณกานต์ จำกัด',
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
  console.log('\n✅ Employee added successfully!');
  console.log(`Employee ID: ${employee.id}`);
}

main().catch(console.error);

