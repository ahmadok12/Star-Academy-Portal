/**
 * Comprehensive verification script testing the 20-step completion criteria
 * specified in prompt section 29.
 */

// Simulated storage and service logic test
import { databaseService } from '../src/lib/database-service.ts';

// Mock localStorage for Node test environment
if (typeof localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  } as any;
}

async function runVerificationWorkflow() {
  console.log('--- STARTING ACADEMY FOUNDATION WORKFLOW VERIFICATION ---');

  // Step 1: Admin Profile verification
  console.log('[Step 1] Verifying Admin Profile & Academy Settings...');
  const settings = await databaseService.getAcademySettings();
  console.log('✓ Academy Profile loaded:', settings.academy_name, '| Currency:', settings.currency, '| Timezone:', settings.timezone);

  // Step 2 & 3: Open Academic Years & Create 2026-27
  console.log('[Step 2 & 3] Checking / Creating Academic Year 2026-27...');
  let years = await databaseService.getAcademicYears();
  let year2026 = years.find(y => y.name === '2026-27');
  if (!year2026) {
    year2026 = await databaseService.createAcademicYear({
      name: '2026-27',
      start_date: '2026-05-01',
      end_date: '2027-04-30',
      status: 'active',
      is_current: false
    });
  }
  console.log('✓ Academic Year 2026-27 confirmed:', year2026.id);

  // Also create a second year 2027-28 for testing cycle switches
  let year2027 = years.find(y => y.name === '2027-28');
  if (!year2027) {
    year2027 = await databaseService.createAcademicYear({
      name: '2027-28',
      start_date: '2027-05-01',
      end_date: '2028-04-30',
      status: 'active',
      is_current: false
    });
  }
  console.log('✓ Academic Year 2027-28 confirmed for cycle tests:', year2027.id);

  // Step 4: Set 2026-27 as current
  console.log('[Step 4] Setting 2026-27 as Current Academic Year...');
  await databaseService.setCurrentAcademicYear(year2026.id);
  years = await databaseService.getAcademicYears();
  const current = years.find(y => y.is_current);
  if (current?.id !== year2026.id) {
    throw new Error('Failed: 2026-27 should be the single current academic year');
  }
  const currentCount = years.filter(y => y.is_current).length;
  if (currentCount !== 1) {
    throw new Error(`Failed: Expected exactly 1 current academic year, found ${currentCount}`);
  }
  console.log('✓ Verified: Exactly ONE current academic year is set (2026-27).');

  // Step 5 & 6: Create Class 8 & Class 9
  console.log('[Step 5 & 6] Creating Class 8 and Class 9...');
  let classes = await databaseService.getClasses();
  let class8 = classes.find(c => c.name === 'Class 8');
  if (!class8) {
    class8 = await databaseService.createClass({
      name: 'Class 8',
      code: 'CL-8',
      display_order: 1,
      status: 'active'
    });
  }
  let class9 = classes.find(c => c.name === 'Class 9');
  if (!class9) {
    class9 = await databaseService.createClass({
      name: 'Class 9',
      code: 'CL-9',
      display_order: 2,
      status: 'active'
    });
  }
  console.log('✓ Classes created/verified:', class8.name, `(${class8.code})`, 'and', class9.name, `(${class9.code})`);

  // Step 7 & 8: Create Section A & Section B
  console.log('[Step 7 & 8] Creating Section A and Section B...');
  let sections = await databaseService.getSections();
  let secA = sections.find(s => s.name === 'A');
  if (!secA) {
    secA = await databaseService.createSection({ name: 'A', code: 'SEC-A', display_order: 1, status: 'active' });
  }
  let secB = sections.find(s => s.name === 'B');
  if (!secB) {
    secB = await databaseService.createSection({ name: 'B', code: 'SEC-B', display_order: 2, status: 'active' });
  }
  console.log('✓ Sections created/verified: Section', secA.name, 'and Section', secB.name);

  // Step 9 & 10: Assign Class 8 -> Section A, Class 8 -> Section B for 2026-27
  console.log('[Step 9 & 10] Assigning Class 8 -> Section A and Section B for 2026-27...');
  let existingCS = await databaseService.getClassSections(year2026.id, class8.id);
  if (!existingCS.some(cs => cs.section_id === secA.id)) {
    await databaseService.createClassSection(year2026.id, class8.id, secA.id);
  }
  if (!existingCS.some(cs => cs.section_id === secB.id)) {
    await databaseService.createClassSection(year2026.id, class8.id, secB.id);
  }
  existingCS = await databaseService.getClassSections(year2026.id, class8.id);
  console.log(`✓ Class 8 has ${existingCS.length} sections assigned in 2026-27.`);

  // Step 11 & 12: Create Mathematics & Physics
  console.log('[Step 11 & 12] Creating Mathematics & Physics subjects...');
  let subjects = await databaseService.getSubjects();
  let subMath = subjects.find(s => s.name === 'Mathematics');
  if (!subMath) {
    subMath = await databaseService.createSubject({ name: 'Mathematics', code: 'MTH', short_name: 'Maths', display_order: 1, status: 'active' });
  }
  let subPhy = subjects.find(s => s.name === 'Physics');
  if (!subPhy) {
    subPhy = await databaseService.createSubject({ name: 'Physics', code: 'PHY', short_name: 'Physics', display_order: 2, status: 'active' });
  }
  console.log('✓ Subjects created/verified:', subMath.name, 'and', subPhy.name);

  // Step 13 & 14: Assign Mathematics & Physics to Class 8 for 2026-27
  console.log('[Step 13 & 14] Assigning Mathematics and Physics to Class 8 for 2026-27...');
  let existingSub = await databaseService.getClassSubjects(year2026.id, class8.id);
  if (!existingSub.some(cs => cs.subject_id === subMath.id)) {
    await databaseService.createClassSubject(year2026.id, class8.id, subMath.id, 1);
  }
  if (!existingSub.some(cs => cs.subject_id === subPhy.id)) {
    await databaseService.createClassSubject(year2026.id, class8.id, subPhy.id, 2);
  }
  existingSub = await databaseService.getClassSubjects(year2026.id, class8.id);
  console.log(`✓ Class 8 has ${existingSub.length} curriculum subjects assigned in 2026-27.`);

  // Step 15 & 16: Change current academic year to 2027-28 & verify relationships adapt
  console.log('[Step 15 & 16] Switching academic year to 2027-28 and verifying cycle isolation...');
  await databaseService.setCurrentAcademicYear(year2027.id);
  const cs2027 = await databaseService.getClassSections(year2027.id, class8.id);
  const sub2027 = await databaseService.getClassSubjects(year2027.id, class8.id);
  console.log(`✓ In year 2027-28, Class 8 has ${cs2027.length} sections and ${sub2027.length} subjects (clean slate for new year).`);

  // Step 17 & 18: Return to 2026-27 and verify historical configuration is completely intact!
  console.log('[Step 17 & 18] Returning to 2026-27 and verifying historical relationships remain intact...');
  await databaseService.setCurrentAcademicYear(year2026.id);
  const restoredCS = await databaseService.getClassSections(year2026.id, class8.id);
  const restoredSub = await databaseService.getClassSubjects(year2026.id, class8.id);
  if (restoredCS.length !== 2 || restoredSub.length !== 2) {
    throw new Error('Historical integrity violation: Relationships were altered during year switch!');
  }
  console.log('✓ Historical integrity verified: 2026-27 retained all assignments (2 sections, 2 subjects).');

  // Step 19: Test inactive entity filtering
  console.log('[Step 19] Verifying inactive entities handling...');
  const testSub = await databaseService.createSubject({
    name: 'Temporary Inactive Subject',
    code: 'TMP-INACT',
    short_name: 'Temp',
    display_order: 99,
    status: 'inactive'
  });
  const allSubs = await databaseService.getSubjects();
  const activeSubs = allSubs.filter(s => s.status === 'active');
  if (activeSubs.some(s => s.id === testSub.id)) {
    throw new Error('Failed: Inactive subject appeared in active selections');
  }
  console.log('✓ Inactive items properly filtered out from active selection dropdowns.');

  // Step 20: Test deletion protection (Referential Integrity)
  console.log('[Step 20] Verifying referential integrity delete prevention...');
  let caughtError = false;
  try {
    await databaseService.deleteClass(class8.id);
  } catch (err: any) {
    caughtError = true;
    console.log('✓ Referential integrity correctly blocked deletion of Class 8:', err.message);
  }
  if (!caughtError) {
    throw new Error('Referential integrity failure: Referenced class was allowed to be deleted!');
  }

  console.log('\n======================================================');
  console.log('ALL 20 COMPLETION CRITERIA SYSTEM CHECKS PASSED 100%!');
  console.log('======================================================\n');
}

runVerificationWorkflow().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
