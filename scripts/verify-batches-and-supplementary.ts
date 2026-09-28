import { databaseService } from '../src/lib/database-service';

async function runVerification() {
  console.log('====================================================');
  console.log(' STAR ACADEMY ERP - BATCHES & SUPPLEMENTARY SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(description: string, condition: boolean, extra?: any) {
    total++;
    if (condition) {
      console.log(`[PASS] ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      if (extra) console.error('       Details:', extra);
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Batches Initial Seed (Advance, Regular, ICU)
    // -------------------------------------------------------------
    const batches = await databaseService.getBatches();
    assert('Batches master retrieved', batches.length >= 3);

    const advanceBatch = batches.find(b => b.code === 'ADV' || b.name.toLowerCase().includes('advance'));
    const regularBatch = batches.find(b => b.code === 'REG' || b.name.toLowerCase().includes('regular'));
    const icuBatch = batches.find(b => b.code === 'ICU' || b.name.toLowerCase().includes('icu'));

    assert('Advance Batch exists', !!advanceBatch);
    assert('Regular Batch exists', !!regularBatch);
    assert('ICU Batch exists', !!icuBatch);

    // -------------------------------------------------------------
    // Test 2: Dynamic Batch Creation and Updates
    // -------------------------------------------------------------
    const customBatch = await databaseService.createBatch({
      name: 'Weekend Crash Batch',
      code: 'WKD',
      description: 'Saturday-Sunday intensive sessions',
      status: 'active'
    });
    assert('Custom dynamic batch created', !!customBatch.id && customBatch.code === 'WKD');

    const updatedBatch = await databaseService.updateBatch(customBatch.id, {
      description: 'Updated weekend schedule'
    });
    assert('Custom dynamic batch updated', updatedBatch.description === 'Updated weekend schedule');

    // -------------------------------------------------------------
    // Test 3: Regular Student Admission with Batch Allocation
    // -------------------------------------------------------------
    const years = await databaseService.getAcademicYears();
    const currentYear = years.find(y => y.is_current) || years[0];
    const classes = await databaseService.getClasses();
    const targetClass = classes[0];
    const classSections = await databaseService.getClassSections(currentYear.id, targetClass.id);
    const targetSection = classSections[0]?.section_id || (await databaseService.getSections())[0].id;
    const subjects = await databaseService.getSubjects();

    const regularStudent = await databaseService.createStudentAdmission(
      {
        student_name: 'Haris Khan',
        father_name: 'Khan Muhammad',
        dob: '2008-04-12',
        gender: 'Male',
        cnic_bform: '35201-9988776-1',
        phone: '0321-1122334',
        address: 'Model Town Lahore',
      },
      {
        academic_year_id: currentYear.id,
        class_id: targetClass.id,
        section_id: targetSection,
        batch_id: advanceBatch!.id,
        enrollment_type: 'regular',
        status: 'active',
        roll_no: 'ADV-101'
      }
    );

    assert('Regular student admitted with Advance Batch', 
      !!regularStudent.id && regularStudent.currentEnrollment?.batch_id === advanceBatch!.id
    );
    assert('Regular student has regular enrollment_type',
      regularStudent.currentEnrollment?.enrollment_type === 'regular'
    );

    // -------------------------------------------------------------
    // Test 4: Supplementary Student Admission with Failed Subjects
    // -------------------------------------------------------------
    const failedSubjects = subjects.slice(0, 2);
    const suppStudent = await databaseService.createStudentAdmission(
      {
        student_name: 'Zainab Bibi',
        father_name: 'Muhammad Aslam',
        dob: '2007-09-20',
        gender: 'Female',
        cnic_bform: '35202-5544332-2',
        phone: '0333-7766554',
        address: 'Johar Town Lahore',
      },
      {
        academic_year_id: currentYear.id,
        class_id: targetClass.id,
        section_id: targetSection,
        batch_id: icuBatch!.id,
        enrollment_type: 'supplementary',
        supplementary_subject_ids: failedSubjects.map(s => s.id),
        supplementary_notes: 'Failed 9th BISE Physics and Math. Appearing in Autumn supplementary exams.',
        status: 'active',
        roll_no: 'SUPP-202'
      }
    );

    assert('Supplementary student admitted with ICU Batch',
      !!suppStudent.id && suppStudent.currentEnrollment?.batch_id === icuBatch!.id
    );
    assert('Supplementary student has supplementary enrollment_type',
      suppStudent.currentEnrollment?.enrollment_type === 'supplementary'
    );
    assert('Supplementary student retains failed subject IDs',
      suppStudent.currentEnrollment?.supplementary_subject_ids?.length === 2
    );

    // -------------------------------------------------------------
    // Test 5: Directory Filtering by Batch & Enrollment Type
    // -------------------------------------------------------------
    const advanceStudents = await databaseService.getStudents(
      currentYear.id,
      'all',
      'all',
      '',
      advanceBatch!.id
    );
    assert('Filter students by Advance Batch returns Haris Khan',
      advanceStudents.some(s => s.id === regularStudent.id)
    );

    const suppStudents = await databaseService.getStudents(
      currentYear.id,
      'all',
      'all',
      '',
      'all',
      'supplementary'
    );
    assert('Filter students by Supplementary category returns Zainab Bibi',
      suppStudents.some(s => s.id === suppStudent.id)
    );
    assert('Filter students by Supplementary excludes regular Haris Khan',
      !suppStudents.some(s => s.id === regularStudent.id)
    );

    // -------------------------------------------------------------
    // Test 6: Reassignment / Quick Enrollment Update
    // -------------------------------------------------------------
    if (suppStudent.currentEnrollment?.id) {
      const updatedRec = await databaseService.updateStudentEnrollment(
        suppStudent.currentEnrollment.id,
        {
          batch_id: regularBatch!.id,
          roll_no: 'REG-303'
        }
      );
      assert('Quick update reassigns student batch to Regular Batch',
        updatedRec.batch_id === regularBatch!.id && updatedRec.roll_no === 'REG-303'
      );
    }

    // -------------------------------------------------------------
    // Test 7: Student Promotion with Target Batch & Supplementary Option
    // -------------------------------------------------------------
    if (years.length > 1) {
      const nextYear = years.find(y => y.id !== currentYear.id) || years[1];
      const promoResult = await databaseService.promoteOrEnrollStudents({
        sourceAcademicYearId: currentYear.id,
        targetAcademicYearId: nextYear.id,
        targetClassId: classes[1]?.id || targetClass.id,
        targetSectionId: targetSection,
        targetBatchId: advanceBatch!.id,
        enrollmentType: 'regular',
        studentIds: [regularStudent.id]
      });
      assert('Student promoted to target year with target batch', promoResult.promotedCount === 1);
    } else {
      console.log('[SKIP] Test 7 skipped (single academic year in environment)');
    }

    console.log('\n====================================================');
    console.log(` RESULT: ${passed} of ${total} tests passed.`);
    console.log('====================================================');

    if (passed === total) {
      console.log('ALL BATCH & SUPPLEMENTARY TESTS COMPLETED SUCCESSFULLY.');
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test suite failed with unexpected error:', err);
    process.exit(1);
  }
}

runVerification();
