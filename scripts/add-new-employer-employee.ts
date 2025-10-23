import { createEmployer, createWorker } from '../server/db.js';
import { storagePut } from '../server/storage.js';
import fs from 'fs';
import path from 'path';

async function uploadFile(filePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const result = await storagePut(fileName, fileBuffer, 'image/jpeg');
  return result.url;
}

async function main() {
  console.log('Starting registration...');

  // Upload documents
  console.log('Uploading documents...');
  const idCardUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/นายจ้าง.jpg');
  const houseRegUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8658961.jpg');
  const photoUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8658963.jpg');
  const passportUrl = await uploadFile('/home/ubuntu/foreign-worker-registration/S__8658964.jpg');

  console.log('Documents uploaded successfully');

  // Register employer
  console.log('Registering employer...');
  const employer = await createEmployer({
    employerType: 'individual',
    companyName: 'ขจรศักดิ์ รอดธานี',
    taxId: '3740300263749',
    registrationNumber: null,
    contactPerson: null,
    contactPosition: null,
    phone: '0000000000',
    email: null,
    fax: null,
    address: '88/146 หมู่ที่ 9',
    subdistrict: 'คลองท่า',
    district: 'คลองหลวง',
    province: 'ปทุมธานี',
    postalCode: '12120',
    businessType: null,
    numberOfEmployees: 1,
    capitalAmount: null,
    notes: null,
    documentsUrl: JSON.stringify([
      { type: 'idCard', url: idCardUrl },
      { type: 'houseRegistration', url: houseRegUrl }
    ]),
    createdBy: null,
  });

  console.log('Employer registered:', employer);

  // Register employee (worker)
  console.log('Registering employee...');
  const employee = await createWorker({
    employerId: employer.id,
    title: null,
    fullName: 'NGUON SEYHA',
    alienId: null,
    nationality: 'กัมพูชา',
    dateOfBirth: new Date('1999-08-02'),
    gender: 'male',
    passportNo: 'T0945275',
    passportIssueDate: new Date('2024-04-30'),
    passportExpiryDate: new Date('2029-04-30'),
    visaType: null,
    visaNo: null,
    visaExpiryDate: null,
    workPermitNo: null,
    workPermitExpiryDate: null,
    addressTh: 'บ้านเตย มีนเช',
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
    notes: null,
    employmentStatus: 'active',
    resignationDate: null,
    profilePhotoUrl: photoUrl,
    documentsUrl: JSON.stringify([
      { type: 'passport', url: passportUrl },
      { type: 'photo', url: photoUrl }
    ]),
    createdBy: null,
  });

  console.log('Employee registered:', employee);
  console.log('\n✅ Registration completed successfully!');
  console.log(`Employer ID: ${employer.id}`);
  console.log(`Employee ID: ${employee.id}`);
}

main().catch(console.error);

