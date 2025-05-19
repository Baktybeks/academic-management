// app/(dashboard)/curator/page.tsx
export default function CuratorPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Панель куратора</h1>
      <p className="mb-4">Добро пожаловать в панель управления куратора.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Управление пользователями
          </h2>
          <p className="text-gray-600 mb-4">
            Создание новых пользователей, просмотр и управление существующими.
          </p>
          <a
            href="/curator/users"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Перейти
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Создание пользователей</h2>
          <p className="text-gray-600 mb-4">
            Регистрация новых преподавателей и студентов в системе.
          </p>
          <a
            href="/curator/create-users"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Перейти
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Управление группами</h2>
          <p className="text-gray-600 mb-4">
            Создание и редактирование учебных групп и распределение студентов.
          </p>
          <a
            href="/curator/groups"
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Перейти
          </a>
        </div>
      </div>
    </div>
  );
}
