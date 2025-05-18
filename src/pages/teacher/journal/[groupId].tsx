import TeacherJournalPage from "@/app/(dashboard)/teacher/journal/[groupId]/page";
import { withAuth } from "@/components/auth/withAuth";
import { UserRole } from "@/types";

const TeacherJournalPageWrapper = () => {
  return <TeacherJournalPage />;
};

export default withAuth(TeacherJournalPageWrapper, [UserRole.TEACHER]);
