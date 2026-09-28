/**
 * Verification script for Phase 5: Timetable & Schedules
 */
import { databaseService } from '../src/lib/database-service';
import { DayOfWeek } from '../src/types/database.types';

// Mock localStorage for test environment
if (typeof localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (k: string) => store.get(k) || null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  } as any;
}

async function runTimetableVerification() {
  console.log('====================================================');
  console.log('    STAR ACADEMY ERP - PHASE 5 TIMETABLE TESTS      ');
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
    // 1. Periods Master
    const periods = await databaseService.getTimetablePeriods();
    assert(periods.length >= 8, `Periods master loaded (${periods.length} periods found)`);
    assert(periods.some(p => p.is_break), 'Recess / break period identified');

    // 2. Academic Years & Master Entities
    const years = await databaseService.getAcademicYears();
    const currentYear = years.find(y => y.is_current) || years[0];
    assert(!!currentYear, `Active academic cycle identified: ${currentYear.name}`);

    const classes = await databaseService.getClasses();
    const class9 = classes.find(c => c.name.includes('9')) || classes[0];
    const class10 = classes.find(c => c.name.includes('10')) || classes[1];
    assert(!!class9 && !!class10, 'Classes 9 and 10 identified');

    const sections = await databaseService.getSections();
    const secA = sections.find(s => s.name.includes('A')) || sections[0];
    const secB = sections.find(s => s.name.includes('B')) || sections[1];
    assert(!!secA && !!secB, 'Sections A and B identified');

    const staffList = await databaseService.getStaff();
    const teachers = staffList.filter(s => s.role === 'teacher');
    assert(teachers.length >= 2, `Teachers found for scheduling (${teachers.length} teachers)`);
    const teacher1 = teachers[0];
    const teacher2 = teachers[1];

    const subjects = await databaseService.getSubjects();
    assert(subjects.length >= 2, `Subjects loaded (${subjects.length} subjects)`);
    const math = subjects.find(s => s.name.toLowerCase().includes('math')) || subjects[0];
    const physics = subjects.find(s => s.name.toLowerCase().includes('physic')) || subjects[1];

    // 3. Timetable Slots
    const initialSlots = await databaseService.getTimetableSlots({ academicYearId: currentYear.id });
    assert(initialSlots.length >= 1, `Existing timetable slots retrieved (${initialSlots.length} slots)`);

    // 4. Create new non-conflicting slot for Wednesday
    const newSlot = await databaseService.createTimetableSlot({
      academic_year_id: currentYear.id,
      class_id: class9.id,
      section_id: secA.id,
      period_id: periods[0].id,
      day_of_week: 'Wednesday',
      period_number: 1,
      start_time: '08:00',
      end_time: '08:45',
      subject_id: math.id,
      teacher_id: teacher1.id,
      room: 'Room 205',
      status: 'active'
    });
    assert(!!newSlot.id, 'New slot created successfully for Wednesday Period 1');

    // 5. Conflict Test 1: Teacher double-booking prevention
    let teacherConflictBlocked = false;
    try {
      await databaseService.createTimetableSlot({
        academic_year_id: currentYear.id,
        class_id: class10.id, // Different class
        section_id: secB.id,
        period_id: periods[0].id,
        day_of_week: 'Wednesday',
        period_number: 1, // Same day & period
        start_time: '08:00',
        end_time: '08:45',
        subject_id: physics.id,
        teacher_id: teacher1.id, // SAME teacher
        room: 'Room 301',
        status: 'active'
      });
    } catch (e: any) {
      if (e.message.includes('Conflict') || e.message.includes('already assigned')) {
        teacherConflictBlocked = true;
      }
    }
    assert(teacherConflictBlocked, 'Conflict prevention blocked teacher double-booking');

    // 6. Conflict Test 2: Class & Section double-booking prevention
    let classConflictBlocked = false;
    try {
      await databaseService.createTimetableSlot({
        academic_year_id: currentYear.id,
        class_id: class9.id, // SAME class
        section_id: secA.id, // SAME section
        period_id: periods[0].id,
        day_of_week: 'Wednesday',
        period_number: 1, // SAME day & period
        start_time: '08:00',
        end_time: '08:45',
        subject_id: physics.id, // Different subject
        teacher_id: teacher2.id, // Different teacher
        room: 'Room 305',
        status: 'active'
      });
    } catch (e: any) {
      if (e.message.includes('Conflict') || e.message.includes('already has')) {
        classConflictBlocked = true;
      }
    }
    assert(classConflictBlocked, 'Conflict prevention blocked class & section double-booking');

    // 7. Conflict Test 3: Room double-booking prevention
    let roomConflictBlocked = false;
    try {
      await databaseService.createTimetableSlot({
        academic_year_id: currentYear.id,
        class_id: class10.id,
        section_id: secB.id,
        period_id: periods[0].id,
        day_of_week: 'Wednesday',
        period_number: 1,
        start_time: '08:00',
        end_time: '08:45',
        subject_id: physics.id,
        teacher_id: teacher2.id,
        room: 'Room 205', // SAME Room
        status: 'active'
      });
    } catch (e: any) {
      if (e.message.includes('Conflict') || e.message.includes('Room')) {
        roomConflictBlocked = true;
      }
    }
    assert(roomConflictBlocked, 'Conflict prevention blocked room double-booking');

    // 8. Filter Slots by Day
    const wednesdaySlots = await databaseService.getTimetableSlots({
      academicYearId: currentYear.id,
      dayOfWeek: 'Wednesday'
    });
    assert(wednesdaySlots.length >= 1, `Filtered by Day 'Wednesday' (${wednesdaySlots.length} slot(s))`);

    // 9. Filter Slots by Teacher (Teacher Timetable view)
    const teacherSlots = await databaseService.getTimetableSlots({
      academicYearId: currentYear.id,
      teacherId: teacher1.id
    });
    assert(teacherSlots.length >= 1, `Teacher timetable schedule retrieved (${teacherSlots.length} lecture slots)`);

    // 10. Update Slot (change room)
    const updatedSlot = await databaseService.updateTimetableSlot(newSlot.id, { room: 'Room 210' });
    assert(updatedSlot.room === 'Room 210', 'Slot room updated successfully');

    // 11. Delete test slot
    await databaseService.deleteTimetableSlot(newSlot.id);
    const afterDelete = await databaseService.getTimetableSlots({
      academicYearId: currentYear.id,
      dayOfWeek: 'Wednesday'
    });
    assert(!afterDelete.some(s => s.id === newSlot.id), 'Test slot deleted cleanly');

    console.log('\n====================================================');
    console.log(` RESULT: ${passed} of ${total} TESTS PASSED (100% SUCCESS) `);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\nVerification halted on unexpected error:', err);
    process.exit(1);
  }
}

runTimetableVerification();
