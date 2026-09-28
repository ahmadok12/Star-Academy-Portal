/**
 * Verification script for Phase 6: Attendance Module
 */
import { databaseService } from '../src/lib/database-service';
import { AttendanceStatus } from '../src/types/database.types';

// Mock localStorage for node test environments
if (typeof localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (k: string) => store.get(k) || null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  } as any;
}

async function runAttendanceVerification() {
  console.log('====================================================');
  console.log('    STAR ACADEMY ERP - PHASE 6 ATTENDANCE TESTS     ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  try {
    // 1. Identify Academic Cycle and Classes
    const years = await databaseService.getAcademicYears();
    const currentYear = years.find(y => y.is_current) || years[0];
    assert(!!currentYear, `Active academic year found: ${currentYear.name}`);

    const classes = await databaseService.getClasses();
    const class9 = classes.find(c => c.code === 'CL-9' || c.name === 'Class 9') || classes[0];
    assert(!!class9, `Target Class found: ${class9.name}`);

    const enrolledStudents = await databaseService.getStudents(currentYear.id);
    const class9Students = enrolledStudents.filter(s => s.academic_record?.class_id === class9.id);
    assert(class9Students.length >= 2, `Enrolled students found in Class 9 (${class9Students.length} students)`);

    // 2. Daily Attendance: Load Existing
    const today = new Date().toISOString().split('T')[0];
    const initialRecords = await databaseService.getDailyAttendance({
      academic_year_id: currentYear.id,
      date: today,
      class_id: class9.id
    });
    assert(Array.isArray(initialRecords), `Retrieved daily attendance records for ${today}`);

    // 3. Daily Attendance: Batch Record / Upsert
    const testDate = '2026-09-25'; // Fixed test date
    const batchToRecord = class9Students.slice(0, 2).map((st, idx) => ({
      academic_year_id: currentYear.id,
      student_id: st.id,
      class_id: class9.id,
      section_id: st.academic_record?.section_id || null,
      batch_id: st.academic_record?.batch_id || null,
      date: testDate,
      status: (idx === 0 ? 'Present' : 'Absent') as AttendanceStatus,
      remarks: idx === 0 ? 'On time' : 'Informed absence',
      recorded_by: null
    }));

    const recorded = await databaseService.recordDailyAttendanceBatch(batchToRecord);
    assert(recorded.length === 2, `Successfully recorded batch daily attendance for ${recorded.length} students`);

    // 4. Verification of Recorded Data
    const verifyFetch = await databaseService.getDailyAttendance({
      academic_year_id: currentYear.id,
      date: testDate,
      class_id: class9.id
    });
    assert(verifyFetch.length >= 2, `Fetched verified records for ${testDate}`);
    const firstStudentRec = verifyFetch.find(r => r.student_id === class9Students[0].id);
    assert(firstStudentRec?.status === 'Present', 'First student status correctly marked as Present');

    // 5. Upsert / No Duplicate Guarantee on Same Date
    const updatePayload = [{
      academic_year_id: currentYear.id,
      student_id: class9Students[0].id,
      class_id: class9.id,
      section_id: class9Students[0].academic_record?.section_id || null,
      batch_id: class9Students[0].academic_record?.batch_id || null,
      date: testDate,
      status: 'Late' as AttendanceStatus,
      remarks: 'Traffic delay updated',
      recorded_by: null
    }];
    await databaseService.recordDailyAttendanceBatch(updatePayload);

    const reFetch = await databaseService.getDailyAttendance({
      academic_year_id: currentYear.id,
      date: testDate,
      class_id: class9.id,
      student_id: class9Students[0].id
    });
    assert(reFetch.length === 1, 'Conflict resolution prevented duplicate record on same date');
    assert(reFetch[0].status === 'Late', 'Record status successfully updated to Late');

    // 6. Attendance KPI Stats Computation
    const kpiStats = await databaseService.getAttendanceKPIs(currentYear.id, testDate, class9.id);
    assert(kpiStats.total >= 2, `KPI total enrolled students computed: ${kpiStats.total}`);
    assert(kpiStats.late >= 1, `KPI late count tracked: ${kpiStats.late}`);
    assert(typeof kpiStats.percentage === 'number', `KPI attendance rate computed: ${kpiStats.percentage}%`);

    // 7. Lecture Attendance & Timetable Integration
    const timetableSlots = await databaseService.getTimetableSlots({
      academic_year_id: currentYear.id,
      class_id: class9.id
    });
    assert(timetableSlots.length > 0, `Timetable slots found for lecture attendance (${timetableSlots.length} slots)`);

    const slot = timetableSlots[0];
    const lecturePayload = [{
      academic_year_id: currentYear.id,
      timetable_slot_id: slot.id,
      student_id: class9Students[0].id,
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id,
      class_id: class9.id,
      section_id: slot.section_id || null,
      date: testDate,
      status: 'Present' as AttendanceStatus,
      remarks: 'Interactive participation',
      recorded_by: slot.teacher_id
    }];

    const recordedLec = await databaseService.recordLectureAttendanceBatch(lecturePayload);
    assert(recordedLec.length === 1, 'Lecture attendance recorded for slot');

    const fetchedLec = await databaseService.getLectureAttendance({
      academic_year_id: currentYear.id,
      timetable_slot_id: slot.id,
      date: testDate
    });
    assert(fetchedLec.length >= 1, `Retrieved lecture attendance for slot ${slot.period_number}`);
    assert(fetchedLec[0].subject_id === slot.subject_id, 'Lecture attendance links to correct subject');

    // 8. Monthly Attendance Register Matrix
    const monthRegister = await databaseService.getStudentMonthlyRegister({
      academic_year_id: currentYear.id,
      class_id: class9.id,
      month: 9,
      year: 2026
    });
    assert(monthRegister.length >= 2, `Monthly attendance register generated for ${monthRegister.length} students`);
    const studentInRegister = monthRegister.find(m => m.student_id === class9Students[0].id);
    assert(!!studentInRegister, 'Student found in monthly register');
    assert(studentInRegister!.records[testDate] === 'Late', `Register contains accurate daily status (${studentInRegister!.records[testDate]})`);

    // 9. Low Attendance Defaulters Filter
    // Record multiple absences for student 2
    const absentDates = ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23'];
    for (const d of absentDates) {
      await databaseService.recordDailyAttendanceBatch([{
        academic_year_id: currentYear.id,
        student_id: class9Students[1].id,
        class_id: class9.id,
        section_id: class9Students[1].academic_record?.section_id || null,
        batch_id: class9Students[1].academic_record?.batch_id || null,
        date: d,
        status: 'Absent',
        remarks: 'Uninformed',
        recorded_by: null
      }]);
    }

    const defaulters = await databaseService.getAttendanceDefaulters(currentYear.id, 75, class9.id);
    assert(defaulters.length > 0, `Defaulters identified below 75% attendance (${defaulters.length} found)`);
    assert(defaulters[0].attendance_percentage < 75, `Defaulter percentage verified: ${defaulters[0].attendance_percentage}%`);

    console.log('\n====================================================');
    console.log(` RESULT: ${passed} of ${total} TESTS PASSED (100% SUCCESS) `);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\nVerification failed:', error);
    process.exit(1);
  }
}

runAttendanceVerification();
