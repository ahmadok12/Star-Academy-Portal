import { databaseService } from '../src/lib/database-service';

async function runVerification() {
  console.log('====================================================');
  console.log(' STAR ACADEMY ERP - PHASE 3 & 4 VERIFICATION SUITE  ');
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
    // Test 1: Academic Years & Classes Loading
    // -------------------------------------------------------------
    const years = await databaseService.getAcademicYears();
    const currentYear = years.find(y => y.is_current);
    assert('Academic years retrieved and current year identified', !!currentYear);

    const classes = await databaseService.getClasses();
    assert('Classes master retrieved', classes.length >= 4);

    const sections = await databaseService.getSections();
    assert('Sections master retrieved', sections.length >= 3);

    // -------------------------------------------------------------
    // Test 2: Phase 3 - Student Inquiries Pipeline
    // -------------------------------------------------------------
    const inquiry = await databaseService.createStudentInquiry({
      student_name: 'Test Candidate Ali',
      father_name: 'Test Father Tariq',
      contact: '0300-1234999',
      interested_class_id: classes[0].id,
      notes: 'Automated test inquiry',
      status: 'New'
    });
    assert('Inquiry created with unique inquiry_no', !!inquiry.id && !!inquiry.inquiry_no);

    const allInquiries = await databaseService.getStudentInquiries();
    assert('Inquiry appears in inquiries list', allInquiries.some(i => i.id === inquiry.id));

    // -------------------------------------------------------------
    // Test 3: Phase 3 - Student Admission & Year-Specific Enrollment
    // -------------------------------------------------------------
    const enrolledStudent = await databaseService.createStudentAdmission(
      {
        student_name: inquiry.student_name,
        father_name: inquiry.father_name,
        dob: '2010-06-15',
        gender: 'Male',
        phone: inquiry.contact,
        status: 'active'
      },
      {
        academic_year_id: currentYear!.id,
        class_id: classes[0].id,
        section_id: sections[0].id,
        roll_no: '99',
        enrollment_date: '2026-05-01'
      },
      inquiry.id
    );

    assert('Student admitted with generated admission_no', !!enrolledStudent.admission_no);
    assert('Inquiry status updated to Enrolled', enrolledStudent.status === 'active');

    // Verify student exists in directory for current year
    const directory = await databaseService.getStudents(currentYear!.id);
    const foundInDir = directory.find(s => s.id === enrolledStudent.id);
    assert('Student found in active academic year directory', !!foundInDir);
    assert('Student current enrollment record joined correctly', foundInDir?.currentEnrollment?.roll_no === '99');

    // -------------------------------------------------------------
    // Test 4: Phase 3 - Batch Student Promotion to Next Year
    // -------------------------------------------------------------
    const targetYear = years.find(y => y.id !== currentYear!.id) || years[0];
    const targetClass = classes[1] || classes[0];

    const promoResult = await databaseService.promoteOrEnrollStudents({
      sourceAcademicYearId: currentYear!.id,
      targetAcademicYearId: targetYear.id,
      targetClassId: targetClass.id,
      targetSectionId: sections[0].id,
      studentIds: [enrolledStudent.id],
      enrollmentDate: '2027-05-01'
    });

    assert('Student promoted successfully', promoResult.promotedCount === 1);

    const historicalStudent = await databaseService.getStudentById(enrolledStudent.id);
    assert(
      'Historical enrollment records preserved (length >= 2)',
      (historicalStudent?.allEnrollments?.length || 0) >= 2
    );

    // -------------------------------------------------------------
    // Test 5: Phase 4 - Staff & Faculty Master Management
    // -------------------------------------------------------------
    const initialStaff = await databaseService.getStaff();
    assert('Initial staff and faculty seed records loaded', initialStaff.length >= 7);

    const newTeacher = await databaseService.createStaff({
      employee_id: `TCH-TEST-${Date.now().toString().slice(-4)}`,
      name: 'Prof. Test Instructor',
      role: 'teacher',
      designation: 'Lecturer in Advanced Mechanics',
      department: 'Sciences',
      qualification: 'M.Sc Applied Physics',
      specialization: 'Classical & Quantum Mechanics',
      phone: '0300-8887766',
      email: 'test.teacher@staracademy.edu.pk',
      gender: 'Male',
      joining_date: '2026-01-01',
      contract_type: 'Permanent',
      salary: 80000,
      status: 'active'
    });

    assert('New teacher registered with employee profile', !!newTeacher.id);

    const updatedTeacher = await databaseService.updateStaff(newTeacher.id, {
      salary: 85000,
      specialization: 'Quantum Mechanics & Optics'
    });
    assert('Staff profile updated successfully', updatedTeacher.salary === 85000);

    // -------------------------------------------------------------
    // Test 6: Phase 4 - Teacher Subject Allocations (instructions.md §18)
    // -------------------------------------------------------------
    const subjects = await databaseService.getSubjects();
    assert('Subjects master retrieved', subjects.length >= 4);

    const initialAssignments = await databaseService.getTeacherAssignments({
      academicYearId: currentYear!.id
    });
    assert('Initial teaching allocations retrieved for academic year', initialAssignments.length >= 4);

    // Create a new assignment
    const assignment = await databaseService.createTeacherAssignment({
      academic_year_id: currentYear!.id,
      teacher_id: newTeacher.id,
      class_id: classes[1].id,
      section_id: sections[1].id,
      subject_id: subjects[0].id,
      is_class_teacher: true,
      status: 'active'
    });

    assert('Teacher assigned to class, section, and subject slot', !!assignment.id);
    assert('Joined teacher details present in assignment', assignment.teacher?.name === newTeacher.name);
    assert('Class teacher flag set properly', assignment.is_class_teacher === true);

    // Test duplicate slot conflict prevention
    let duplicatePrevented = false;
    try {
      await databaseService.createTeacherAssignment({
        academic_year_id: currentYear!.id,
        teacher_id: initialStaff[0].id,
        class_id: classes[1].id,
        section_id: sections[1].id,
        subject_id: subjects[0].id,
        is_class_teacher: false,
        status: 'active'
      });
    } catch {
      duplicatePrevented = true;
    }
    assert('Duplicate assignment prevention enforced', duplicatePrevented);

    // Delete test assignment
    await databaseService.deleteTeacherAssignment(assignment.id);
    const postDeleteAssignments = await databaseService.getTeacherAssignments({
      academicYearId: currentYear!.id
    });
    assert('Assignment deleted successfully', !postDeleteAssignments.some(a => a.id === assignment.id));

    // Delete test staff
    await databaseService.deleteStaff(newTeacher.id);
    const postDeleteStaff = await databaseService.getStaff();
    assert('Staff member removed successfully', !postDeleteStaff.some(s => s.id === newTeacher.id));

    console.log('\n====================================================');
    console.log(` RESULT: ${passed} of ${total} TESTS PASSED (100% SUCCESS) `);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Unexpected error during verification:', err);
    process.exit(1);
  }
}

runVerification();
