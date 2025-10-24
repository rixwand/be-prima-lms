# Course Domain

The course domain groups authoring features that require authenticated access (unless otherwise noted). Routes are organised as follows:

- [`Course`](./Course.md)
- [`Course Sections`](./CourseSections.md)
- [`Lessons`](./Lessons.md)
- [`Lesson Blocks`](./LessonBlocks.md)

Public course discovery endpoints are located under `/api/courses`. Author-owned operations use `/api/me/...` prefixes and honour course ownership plus RBAC permissions.
